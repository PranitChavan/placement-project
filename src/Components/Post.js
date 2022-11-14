import { useEffect, useState } from 'react';
import { arrayRemove, collection, getDocs } from 'firebase/firestore';
import { db } from '../Config/firebaseCfg';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, arrayUnion, query, where, getDoc } from 'firebase/firestore';
import Button from './Button';
import { utils, writeFileXLSX } from 'xlsx';
import ReactReadMoreReadLess from 'react-read-more-read-less';
import './Post.css';

export default function Post({ modalState, loggedInUser }) {
  const [jobPosts, setJobPosts] = useState([]);
  const [appliedStudentsData, setAppliedStudentsData] = useState([]);
  const { accountType, currentUser, allJobPosts } = useAuth();
  const [loading, setLoading] = useState(false);

  const collectionRef = collection(db, 'Teachers');
  const collectionRefStudents = collection(db, 'Students');

  const washingtonRef = doc(db, 'Students', currentUser.uid);
  const washingtonRef1 = doc(db, 'Teachers', currentUser.uid);

  useEffect(() => {
    let isApiSubscribed = true;

    async function getAllPostsData() {
      if (isApiSubscribed) {
        await getAllPosts();
      }
    }

    getAllPostsData();

    return () => {
      isApiSubscribed = false;
    };
  }, [allJobPosts]);

  async function getAllPosts() {
    const postsData = [];
    try {
      if (accountType(currentUser) === 'Teacher') {
        try {
          const docRef = doc(db, 'Teachers', currentUser.uid);

          const res = await getDoc(docRef);

          if (!res.data()) return;

          setJobPosts(() => {
            return [...res.data().posts];
          });

          return;
        } catch (err) {
          console.log(err);
        }
      }

      const response = await getDocs(collectionRef);

      response.docs.map((item) => {
        postsData.push({ ...item.data().posts });
      });

      formatData(postsData);
    } catch (err) {
      console.log(err);
    }
  }

  function formatData(data) {
    if (!data) return;

    const formattedData = [];

    data.forEach((d) => {
      for (let key in d) {
        formattedData.push(d[key]);
      }
    });

    setJobPosts(formattedData);
  }

  async function saveJobPostingDetails(id) {
    const alreadyApplied = await setDisabledOrEnabled(id);

    if (alreadyApplied) {
      alert('You have already applied for this job');
      return;
    }

    if (!loggedInUser) {
      alert('Please fill the form before applying for this job.');
      return;
    }

    if (loggedInUser && !loggedInUser.isFormFilled) {
      alert('Please fill the form before applying for this job.');
      return;
    }

    setLoading(true);
    try {
      await updateDoc(washingtonRef, {
        jobsAppliedFor: arrayUnion(id),
      });

      alert('Your application was successfully sent!');
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }

  function exportExcel(d, companyName) {
    const formattedData = [];

    d.forEach((data) => {
      const { contact, email, graduationYear, name, qualification, resumeUrl } = data;
      formattedData.push({ contact, email, graduationYear, name, qualification, resumeUrl });
    });

    if (!formattedData.length) return;

    let wb = utils.book_new();
    let ws = utils.json_to_sheet(formattedData);
    utils.book_append_sheet(wb, ws, 'mySheet');
    writeFileXLSX(wb, `${companyName}.xlsx`);
  }

  async function downloadHandler(jobId, companyName) {
    const data = [];

    try {
      const queryD = query(collectionRefStudents, where('jobsAppliedFor', 'array-contains', jobId));

      const res = await getDocs(queryD);

      res.docs.map((item) => {
        data.push({ ...item.data(), id: item.id });
      });

      setAppliedStudentsData(data);

      if (data.length === 0) alert('No Students have applied yet!');

      exportExcel(data, companyName);
    } catch (err) {
      console.log(err);
    }
  }

  async function deleteJobPosting(id) {
    try {
      const dataToBeDeleted = jobPosts.filter((post) => post.id === id);
      setJobPosts(jobPosts.filter((post) => post.id !== id));

      await updateDoc(washingtonRef1, {
        posts: arrayRemove(dataToBeDeleted[0]),
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function setDisabledOrEnabled(jobId) {
    try {
      const colRef = doc(db, 'Students', currentUser.uid);
      const res = await getDoc(colRef);

      const jobsAppliedByCurrentUser = [...res.data().jobsAppliedFor];

      return jobsAppliedByCurrentUser.some((id) => id === jobId);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <h1 className="text-warning mb-4"> Postings</h1>
      <div className="container">
        <div className="row">
          {jobPosts.map((data) => {
            return (
              <div className="col-lg-6 my-2" key={data.id}>
                <div className="card" style={{ backgroundColor: '#D9D9D9' }}>
                  <div className="card-body">
                    <div className="modal-header">
                      <h5 className="modal-title fs-3">JR. Java Developer</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>

                    <h5 className="card-title text-primary fs-4 mb-3">{data.companyName}</h5>
                    <p className="fs-5">Pune,maharashtra india</p>

                    <button disabled className="btn bg-dark text-warning border border-0 mb-5">
                      <small className="text-warning">java,css,c++</small>
                    </button>
                    <br></br>

                    <ReactReadMoreReadLess
                      charLimit={50}
                      readMoreText={<p className="text-dark fw-bold text-primary">....show more</p>}
                      readLessText={<p className="text-dark fw-bold text-primary">....show less</p>}
                    >
                      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aperiam beatae quasi deserunt placeat ad
                      modi, necessitatibus ab enim. Ut, repudiandae illum aperiam unde ab impedit natus iste deserunt
                      obcaecati harum?
                    </ReactReadMoreReadLess>

                    {accountType(currentUser) === 'Student' && (
                      <Button onClick={() => saveJobPostingDetails(data.id)} className="btn btn-success col-12">
                        Apply
                      </Button>
                    )}

                    <Button
                      onClick={() => downloadHandler(data.id, data.companyName)}
                      className={accountType(currentUser) === 'Student' ? 'hide' : 'btn btn-success col-12'}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
//   return (
//     <>
//       <h1>Job Postings</h1>

//       {jobPosts.map((data) => {
//         return (
//           <div className="cards" key={data.id}>
//             <div className="services">
//               <div className="content content-1">
//                 <Button
//                   onClick={() => deleteJobPosting(data.id)}
//                   className={accountType(currentUser) === 'Student' && 'hide'}
//                 >
//                   Delete
//                 </Button>
//                 <div className="fab fa-facebook"></div>
//                 <h2>{data.companyName}</h2>
//                 <p>{data.jobDescription}</p>

//                 {accountType(currentUser) === 'Student' && (
//                   <Button onClick={() => saveJobPostingDetails(data.id)}>Apply</Button>
//                 )}

//                 <Button
//                   onClick={() => downloadHandler(data.id, data.companyName)}
//                   className={accountType(currentUser) === 'Student' && 'hide'}
//                 >
//                   Download
//                   {/* <ReactCSV companyData={data} studentData={appliedStudentsData} /> */}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </>
//   );
// }
