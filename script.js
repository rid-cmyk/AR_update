const fs = require('fs');
const path = 'C:\\Users\\farre\\AR_update\\app\\(dashboard)\\guru\\dashboard\\GuruDashboardClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace function signature and state
content = content.replace(
  'export default function GuruDashboard() {\\n  const [dashboardStats, setDashboardStats] = useState<any>(null);\\n  const [halaqahData, setHalaqahData] = useState<DashboardData | null>(null);\\n  const [loading, setLoading] = useState(false);',
  'interface GuruDashboardClientProps {\\n  dashboardStats: any;\\n  halaqahData: any;\\n}\\n\\nexport default function GuruDashboardClient({ dashboardStats, halaqahData }: GuruDashboardClientProps) {'
);

// Remove fetchHalaqahData
const fetchHalStart = content.indexOf('  // Fetch halaqah data for this guru');
const fetchAnaStart = content.indexOf('  // Fetch analytics data');
content = content.slice(0, fetchHalStart) + content.slice(fetchAnaStart);

// Remove fetchAnalyticsData
const fetchAnaStart2 = content.indexOf('  // Fetch analytics data');
const navStart = content.indexOf('  // Navigation handlers');
content = content.slice(0, fetchAnaStart2) + content.slice(navStart);

// Replace useEffect
content = content.replace(
  /  useEffect\(\(\) => \{[\s\S]*?\}, \[fetchAnalyticsData\]\);/,
    useEffect(() => {
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      router.refresh();
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [router]);
);

// Remove loading spinner block
const loadingStart = content.indexOf('        {loading ? (');
const loadingEnd = content.indexOf('          <>\\r\\n            {/* Statistics Cards */}');
if (loadingEnd === -1) {
    const loadingEndLnx = content.indexOf('          <>\\n            {/* Statistics Cards */}');
    content = content.slice(0, loadingStart) + content.slice(loadingEndLnx + 13);
} else {
    content = content.slice(0, loadingStart) + content.slice(loadingEnd + 14);
}


// Remove closing brace of loading block
content = content.replace('            </Row>\\r\\n          </>\\r\\n        )}', '            </Row>');
content = content.replace('            </Row>\\n          </>\\n        )}', '            </Row>');

fs.writeFileSync(path, content);
console.log('Done');
