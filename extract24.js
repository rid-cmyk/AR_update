const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/guru/dashboard/GuruDashboardClient.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `        {/* Performance Bar Chart */}
        <GuruPerformanceChart perfBarData={perfBarData} />`;

lines.splice(265, 34, replacement);

const importLines = `import GuruPerformanceChart from "@/components/guru/dashboard/GuruPerformanceChart";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";', 'import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
