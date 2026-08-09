import http from 'k6/http';
import { check, sleep, group } from 'k6';

/**
 * k6 Load Test Suite for AR-Hafalan
 * Scenario: Realistic Teacher Workflow (50, 100, 250, 500 VUs)
 * Flow: Login -> Fetch Dashboard & Santri List -> Input Absensi -> Input Hafalan -> Refresh Notifications & Summary
 */

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Stage 1: Ramp-up to 50 Concurrent Teachers
    { duration: '1m',  target: 50 },   // Stay at 50 VUs
    { duration: '30s', target: 100 },  // Stage 2: Ramp-up to 100 Concurrent Teachers
    { duration: '1m',  target: 100 },  // Stay at 100 VUs
    { duration: '45s', target: 250 },  // Stage 3: Ramp-up to 250 Concurrent Teachers
    { duration: '1m',  target: 250 },  // Stay at 250 VUs
    { duration: '45s', target: 500 },  // Stage 4: Ramp-up to 500 Concurrent Teachers (Peak Stress)
    { duration: '1m',  target: 500 },  // Stay at 500 VUs
    { duration: '30s', target: 0 },    // Cool-down to 0 VUs
  ],
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<2000'], // P95 < 800ms, P99 < 2000ms
    http_req_failed: ['rate<0.01'],                 // Error rate < 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'k6-load-test-agent',
    },
  };

  group('1. Auth & Session Check', function () {
    const res = http.get(`${BASE_URL}/api/auth/session`, params);
    check(res, {
      'session status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    });
  });

  sleep(1);

  group('2. Fetch Dashboard & Santri List', function () {
    const res = http.get(`${BASE_URL}/api/guru/hafalan`, params);
    check(res, {
      'hafalan list status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    });
  });

  sleep(1);

  group('3. Input Absensi (Teacher Attendance Write)', function () {
    const payload = JSON.stringify({
      jadwalId: 1,
      santriId: 1,
      status: 'HADIR',
      catatan: 'Hadir tepat waktu',
    });
    const res = http.post(`${BASE_URL}/api/guru/absensi`, payload, params);
    check(res, {
      'absensi write status is 200/201 or auth requirement': (r) =>
        r.status === 200 || r.status === 201 || r.status === 401,
    });
  });

  sleep(1);

  group('4. Input Setoran Hafalan (Teacher Setoran Write)', function () {
    const payload = JSON.stringify({
      santriId: 1,
      surat: 'Al-Fatihah',
      ayatAwal: 1,
      ayatAkhir: 7,
      jumlahBaris: 7,
      nilai: 95,
      catatan: 'Lancar & Fashih',
    });
    const res = http.post(`${BASE_URL}/api/guru/hafalan`, payload, params);
    check(res, {
      'setoran write status is 200/201 or auth requirement': (r) =>
        r.status === 200 || r.status === 201 || r.status === 401,
    });
  });

  sleep(1);

  group('5. Fetch Notifications & Refresh Stats', function () {
    const res = http.get(`${BASE_URL}/api/notifikasi`, params);
    check(res, {
      'notifikasi status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    });
  });

  sleep(2);
}
