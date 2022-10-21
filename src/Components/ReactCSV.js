import { CSVLink } from 'react-csv';

export default function ReactCSV({ companyData, studentData }) {
  const { companyName } = companyData;

  const headers = [
    { label: 'Name', key: 'name' },
    { label: 'email', key: 'email' },
    { label: 'resume', key: 'resumeUrl' },
  ];

  return (
    <>
      {studentData && studentData.length > 0 ? (
        <CSVLink data={studentData} headers={headers} filename={`${companyName}applicants.csv`} target="_blank">
          Download
        </CSVLink>
      ) : (
        'Download'
      )}
    </>
  );
}
