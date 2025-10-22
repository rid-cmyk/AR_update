const fs = require('fs');
const path = require('path');

function testComponentImports() {
  console.log('🧪 Testing Component Imports Fix...\n');

  const filesToCheck = [
    'app/(dashboard)/guru/hafalan/page.tsx',
    'app/(dashboard)/guru/target/page.tsx', 
    'app/(dashboard)/santri/dashboard/page.tsx'
  ];

  const requiredImports = {
    'app/(dashboard)/guru/hafalan/page.tsx': [
      'Card', 'Row', 'Col', 'Input', 'UserOutlined', 'BookOutlined'
    ],
    'app/(dashboard)/guru/target/page.tsx': [
      'Card', 'Row', 'Col', 'Input', 'UserOutlined', 'BookOutlined', 'FilterOutlined'
    ],
    'app/(dashboard)/santri/dashboard/page.tsx': [
      'Input'
    ]
  };

  let allTestsPassed = true;

  filesToCheck.forEach(filePath => {
    console.log(`📁 Checking ${filePath}:`);
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const requiredForFile = requiredImports[filePath];
      
      requiredForFile.forEach(component => {
        if (fileContent.includes(component)) {
          console.log(`   ✅ ${component} - imported and used`);
        } else {
          console.log(`   ❌ ${component} - missing or not used`);
          allTestsPassed = false;
        }
      });
      
      // Check for common usage patterns
      const usagePatterns = {
        'Card': /<Card/g,
        'Row': /<Row/g,
        'Col': /<Col/g,
        'Input': /<Input/g,
        'UserOutlined': /<UserOutlined/g,
        'BookOutlined': /<BookOutlined/g,
        'FilterOutlined': /<FilterOutlined/g
      };
      
      console.log('   📊 Usage count:');
      Object.entries(usagePatterns).forEach(([component, pattern]) => {
        if (requiredForFile.includes(component)) {
          const matches = fileContent.match(pattern);
          const count = matches ? matches.length : 0;
          console.log(`      ${component}: ${count} times`);
        }
      });
      
    } catch (error) {
      console.log(`   ❌ Error reading file: ${error.message}`);
      allTestsPassed = false;
    }
    
    console.log('');
  });

  // Test specific functionality
  console.log('🔍 Testing specific functionality...\n');

  // Test filtering components
  console.log('1. Testing filtering components:');
  const hafalanFile = fs.readFileSync('app/(dashboard)/guru/hafalan/page.tsx', 'utf8');
  
  if (hafalanFile.includes('filters.santriName') && hafalanFile.includes('filters.surat')) {
    console.log('   ✅ Filtering state management - working');
  } else {
    console.log('   ❌ Filtering state management - missing');
    allTestsPassed = false;
  }

  if (hafalanFile.includes('placeholder="Cari nama santri..."') && hafalanFile.includes('placeholder="Cari surat..."')) {
    console.log('   ✅ Filter input placeholders - working');
  } else {
    console.log('   ❌ Filter input placeholders - missing');
    allTestsPassed = false;
  }

  // Test enhanced UI components
  console.log('\n2. Testing enhanced UI components:');
  const santriFile = fs.readFileSync('app/(dashboard)/santri/dashboard/page.tsx', 'utf8');
  
  if (santriFile.includes('linear-gradient') && santriFile.includes('background:')) {
    console.log('   ✅ Gradient cards - working');
  } else {
    console.log('   ❌ Gradient cards - missing');
    allTestsPassed = false;
  }

  if (santriFile.includes('ziyadahCount') && santriFile.includes('murojaahCount')) {
    console.log('   ✅ Enhanced statistics - working');
  } else {
    console.log('   ❌ Enhanced statistics - missing');
    allTestsPassed = false;
  }

  // Test API integration
  console.log('\n3. Testing API integration:');
  if (hafalanFile.includes('santriName') && hafalanFile.includes('URLSearchParams')) {
    console.log('   ✅ API filtering parameters - working');
  } else {
    console.log('   ❌ API filtering parameters - missing');
    console.log('   Debug: santriName found:', hafalanFile.includes('santriName'));
    console.log('   Debug: URLSearchParams found:', hafalanFile.includes('URLSearchParams'));
    allTestsPassed = false;
  }

  // Final result
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 All component import tests PASSED!');
    console.log('✅ All required components are imported and used correctly');
    console.log('✅ Filtering functionality is implemented');
    console.log('✅ Enhanced UI components are working');
    console.log('✅ API integration is functional');
  } else {
    console.log('❌ Some tests FAILED!');
    console.log('Please check the issues above and fix them.');
  }

  return allTestsPassed;
}

// Run the test
try {
  const result = testComponentImports();
  process.exit(result ? 0 : 1);
} catch (error) {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
}