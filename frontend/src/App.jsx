import { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

function App() {
  const [tickets, setTickets] = useState([]);
  const [answers, setAnswers] = useState({});

  const fetchTickets = () => {
    fetch(`${API_BASE_URL}/api/chat/tickets?limit=50`)
      .then((res) => res.json())
      .then((data) => setTickets(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (id, value) => {
    setAnswers({ ...answers, [id]: value });
  };

  const submitAnswer = (id) => {
    const answer = answers[id]?.trim();
    if (!answer) return;

    fetch(`${API_BASE_URL}/api/chat/tickets/${id}/resolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answer,
        resolved_by: "admin",
      }),
    })
      .then((res) => res.json())
      .then(fetchTickets);
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>Admin Panel - Tickets</h1>

      {tickets.length === 0 ? (
        <p>No tickets found</p>
      ) : (
        tickets.map((ticket) => (
          <div
            key={ticket.ticket_id}
            style={{
              border: "1px solid white",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <p><b>Question:</b> {ticket.question}</p>
            <p><b>Email:</b> {ticket.email}</p>
            <p><b>Status:</b> {ticket.status}</p>

            {ticket.status !== "resolved" && (
              <>
                <input
                  type="text"
                  placeholder="Type answer..."
                  onChange={(e) => handleChange(ticket.ticket_id, e.target.value)}
                  style={{ marginRight: "10px", padding: "5px" }}
                />
                <button onClick={() => submitAnswer(ticket.ticket_id)}>
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
