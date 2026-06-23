import { useEffect, useState } from "react";

function App() {
  const [queries, setQueries] = useState([]);
  const [answers, setAnswers] = useState({});

  // Fetch queries
  const fetchQueries = () => {
    fetch("http://127.0.0.1:8000/queries")
      .then((res) => res.json())
      .then((data) => setQueries(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  // Handle input change
  const handleChange = (id, value) => {
    setAnswers({ ...answers, [id]: value });
  };

  // Submit answer
  const submitAnswer = (id) => {
    fetch("http://127.0.0.1:8000/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        answer: answers[id],
      }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchQueries(); // refresh data
      });
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>Admin Panel - Queries</h1>

      {queries.length === 0 ? (
        <p>No queries found</p>
      ) : (
        queries.map((q) => (
          <div
            key={q.id}
            style={{
              border: "1px solid white",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <p><b>Question:</b> {q.question}</p>
            <p><b>Email:</b> {q.email}</p>
            <p><b>Status:</b> {q.status}</p>
            <p><b>Answer:</b> {q.answer || "Not answered yet"}</p>

            {q.status === "pending" && (
              <>
                <input
                  type="text"
                  placeholder="Type answer..."
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  style={{ marginRight: "10px", padding: "5px" }}
                />
                <button onClick={() => submitAnswer(q.id)}>
                  Submit Answer
                </button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default App;