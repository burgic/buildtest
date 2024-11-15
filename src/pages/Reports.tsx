import React from 'react';
import { Download, Share2, Eye } from 'lucide-react';

const Reports: React.FC = () => {
  const reports = [
    {
      id: 1,
      title: 'Financial Summary Report',
      client: 'John Doe',
      date: '2024-03-15',
      status: 'Complete',
    },
    {
      id: 2,
      title: 'Investment Analysis',
      client: 'Jane Smith',
      date: '2024-03-14',
      status: 'Pending Review',
    },
    {
      id: 3,
      title: 'Retirement Planning',
      client: 'Mike Johnson',
      date: '2024-03-13',
      status: 'In Progress',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Generated Reports</h2>

      <div className="grid gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Client: {report.client}</p>
                <p className="text-sm text-gray-500">Generated: {report.date}</p>
                <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                  {report.status}
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;