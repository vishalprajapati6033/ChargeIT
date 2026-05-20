import { useEffect, useState } from "react";
import { db, collection, getDocs, doc, updateDoc } from "../../firebase";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import { generateStudyPlan } from "../../fireService";

const StudentDashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [classes, setClasses] = useState([]);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [studyPlan, setStudyPlan] = useState(null);
  const [openSections, setOpenSections] = useState({
    classes: false,
    assignments: false,
    studyPlan: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "Student") {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch all classes
        const classSnapshot = await getDocs(collection(db, "classes"));
        const allClasses = classSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClasses(allClasses);

        // Fetch enrolled classes from student document
        const studentRef = doc(db, "users", user.uid);
        const studentSnap = await getDocs(collection(db, "users"));
        const studentData = studentSnap.docs.find((doc) => doc.id === user.uid);

        if (studentData && studentData.data().enrolledClasses) {
          setEnrolledClasses(studentData.data().enrolledClasses);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchData();
  }, [user, navigate]);

  // Function to enroll in a class
  const enrollInClass = async (classId) => {
    try {
      const studentRef = doc(db, "users", user.uid);
      const updatedEnrolledClasses = [...enrolledClasses, classId];

      await updateDoc(studentRef, {
        enrolledClasses: updatedEnrolledClasses,
      });

      setEnrolledClasses(updatedEnrolledClasses);
    } catch (error) {
      console.error("Error enrolling in class:", error);
    }
  };

  // Function to generate study plan using fetched class data
  const generatePlan = async () => {
    console.log("📱 Generate Study Plan Button Clicked!");

    try {
      // Generate a syllabus from enrolled classes dynamically
      const syllabus = enrolledClasses
        .map((classId) => {
          const classData = classes.find((cls) => cls.id === classId);
          if (classData) {
            // Ensure topics exist and is an array before joining
            const topics = Array.isArray(classData.topics) ? classData.topics.join(", ") : "No topics available";
            return `${classData.className}: ${topics}`;
          }
          return ""; // In case classData is not found
        })
        .filter(Boolean) // Remove empty values from the syllabus
        .join("\n");

      console.log("📌 Generated Syllabus:", syllabus);

      if (!syllabus) {
        setStudyPlan("❌ No enrolled classes found. Please enroll in classes first.");
        return;
      }

      console.log("📌 Fetching study plan...");
      const plan = await generateStudyPlan("Computer Science", syllabus);

      console.log("📌 Study Plan:", plan);

      // Ensure study plan has valid data
      if (!plan || plan.includes("❌ Error")) {
        setStudyPlan("❌ Error generating study plan. Please try again.");
        return;
      }

      setStudyPlan(plan); // Update state with valid plan
      setOpenSections((prev) => ({ ...prev, studyPlan: true })); // Open section
    } catch (error) {
      console.error("❌ Error generating study plan:", error);
      setStudyPlan("❌ Error generating study plan. Please try again.");
    }
  };

  // Toggle sections
  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Dashboard Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>

        {/* Available Classes Section */}
        <section>
          <h2
            className="text-xl font-semibold mt-6 cursor-pointer flex items-center gap-2"
            onClick={() => toggleSection("classes")}
          >
            Available Classes
            <span>{openSections.classes ? "▲" : "▼"}</span>
          </h2>
          {openSections.classes &&
            classes.map((cls) => (
              <div
                key={cls.id}
                className="p-4 border my-2 flex justify-between items-center"
              >
                <div>
                  <span className="font-semibold">{cls.className}</span>
                  <span className="ml-4 text-gray-600">Marks: {cls.mark}</span>
                </div>
                {!enrolledClasses.includes(cls.id) && (
                  <button
                    className="bg-blue-500 text-white px-4 py-1 rounded"
                    onClick={() => enrollInClass(cls.id)}
                  >
                    Enroll
                  </button>
                )}
              </div>
            ))}
        </section>

        {/* Assignments Section */}
        <section>
          <h2
            className="text-xl font-semibold mt-6 cursor-pointer flex items-center gap-2"
            onClick={() => toggleSection("assignments")}
          >
            Assignments ({assignments.length})
            <span>{openSections.assignments ? "▲" : "▼"}</span>
          </h2>
          {openSections.assignments &&
            assignments.map((assignment) => (
              <div key={assignment.id} className="p-4 border my-2">
                <p>{assignment.title}</p>
                {assignment.fileURL && (
                  <a
                    href={assignment.fileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View Assignment
                  </a>
                )}
              </div>
            ))}
        </section>

        {/* Study Plan Section */}
        <section>
          <h2
            className="text-xl font-semibold mt-6 cursor-pointer flex items-center gap-2"
            onClick={() => toggleSection("studyPlan")}
          >
            Study Plan
            <span>{openSections.studyPlan ? "▲" : "▼"}</span>
          </h2>
          {openSections.studyPlan && studyPlan && (
            <div className="p-4 border my-2 bg-white rounded shadow">
              <pre className="whitespace-pre-wrap">{studyPlan}</pre>
            </div>
          )}
          {!studyPlan && (
            <button
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
              onClick={generatePlan}
            >
              Generate Study Plan
            </button>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;