import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../Config/firebaseCfg';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function FormModal(props) {
  const [formData, setFormData] = useState();
  const { currentUser, setJobPosts } = useAuth();

  const washingtonRef = doc(db, 'Teachers', currentUser.uid);

  const inputHandler = function (e) {
    const id = e.target.id;
    const value = e.target.value;

    setFormData((prevData) => {
      return { ...prevData, [id]: value, teacherId: currentUser.uid, id: Date.now() };
    });
  };

  const submitHandler = function (e) {
    e.preventDefault();
    saveJobPostingDetails();
    setJobPosts(formData);
    props.onHide();
  };

  async function saveJobPostingDetails() {
    try {
      await updateDoc(washingtonRef, {
        posts: arrayUnion(formData),
      });
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Job Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={submitHandler}>
          <div className="mb-3">
            <label htmlFor="companyName" className="form-label">
              Company Name
            </label>
            <input
              type="text"
              className="form-control"
              id="companyName"
              aria-describedby="emailHelp"
              required
              onChange={inputHandler}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="skillsRequired" className="form-label">
              Skills Required
            </label>
            <input type="text" className="form-control" id="skillsRequired" required onChange={inputHandler} />
          </div>
          <div className="mb-3">
            <label htmlFor="jobDescription" className="form-label">
              Job description
            </label>
            <textarea className="form-control" id="jobDescription" rows="3" required onChange={inputHandler}></textarea>
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      </Modal.Body>
    </Modal>
  );
}
