import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import FloatingLines from "./FloatingLines";
import "./Home.css";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room Id is generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both the field is requried");
      return;
    }

    // redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
    toast.success("New Room is created");
  };

  // when enter then also join
  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="home-container">
      <FloatingLines
        linesGradient={["#8B5CF6", "#A855F7", "#D946EF", "#F0ABFC"]}
        enabledWaves={["top", "middle", "bottom"]}
        lineCount={[8, 6, 4]}
        lineDistance={[6, 5, 4]}
        animationSpeed={0.8}
        interactive={true}
        bendRadius={5.0}
        bendStrength={-0.5}
        parallax={true}
        parallaxStrength={0.2}
      />
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-12 col-md-6">
          <h1 className="main-title">Codeit : Code Together!</h1>
          <div className="card shadow-sm p-2 mb-5 rounded home-card">
            <div className="card-body text-center">
              <h4 className="card-title mb-4 home-title">Enter the ROOM ID</h4>

              <div className="form-group">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="form-control mb-2 home-input"
                  placeholder="ROOM ID"
                  onKeyUp={handleInputEnter}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control mb-2 home-input"
                  placeholder="USERNAME"
                  onKeyUp={handleInputEnter}
                />
              </div>
              <button
                onClick={joinRoom}
                className="btn btn-lg btn-block home-join-btn"
              >
                JOIN
              </button>
              <p className="mt-3 text-light">
                Don't have an existing room ID? Create{""}
                <span
                  onClick={generateRoomId}
                  className="home-new-room"
                >
                  {" "}
                  New Room
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

