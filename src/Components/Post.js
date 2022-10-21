import { useEffect, useState } from 'react';
import { arrayRemove, collection, getDocs } from 'firebase/firestore';
import { db, app, storage } from '../Config/firebaseCfg';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, arrayUnion, query, where, getDoc } from 'firebase/firestore';
import Button from './Button';
import ReactCSV from './ReactCSV';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';

import './Post.css';

export default function Post({ modalState, loggedInUser }) {
  const [jobPosts, setJobPosts] = useState([]);
  const [appliedStudentsData, setAppliedStudentsData] = useState([]);
  const { accountType, currentUser, getSpecificUserDataById } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const auth = getAuth(app);
  const [userrr] = useAuthState(auth);

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
  }, [modalState]);

  console.log(userrr);

  async function getAllPosts() {
    const postsData = [];
    try {
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
    const [postsObj] = data;
    const formattedData = [];

    for (let key in postsObj) {
      formattedData.push(postsObj[key]);
    }

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

  async function downloadHandler(jobId) {
    const data = [];

    try {
      const queryD = query(collectionRefStudents, where('jobsAppliedFor', 'array-contains', jobId));
      const res = await getDocs(queryD);

      res.docs.map((item) => {
        data.push({ ...item.data(), id: item.id });
      });

      setAppliedStudentsData(data);

      if (data.length === 0) alert('No Students have applied yet!');
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
      <h1>Job Postings</h1>

      {jobPosts.map((data) => {
        return (
          <div className="cards" key={data.id}>
            <div className="services">
              <div className="content content-1">
                <Button
                  onClick={() => deleteJobPosting(data.id)}
                  className={accountType(currentUser) === 'Student' && 'hide'}
                >
                  Delete
                </Button>
                <div className="fab fa-facebook"></div>
                <h2>{data.companyName}</h2>
                <p>{data.jobDescription}</p>

                {accountType(currentUser) === 'Student' && (
                  <Button onClick={() => saveJobPostingDetails(data.id)}>Apply</Button>
                )}

                <Button
                  onClick={() => downloadHandler(data.id)}
                  className={accountType(currentUser) === 'Student' && 'hide'}
                >
                  <ReactCSV companyData={data} studentData={appliedStudentsData} />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
