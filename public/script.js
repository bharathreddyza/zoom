// const { Socket } = require("dgram");
const socket = io("/");
const videoGrid = document.getElementById("video-grid");
console.log(videoGrid);
const myVideo = document.createElement("video");
myVideo.muted = true;

const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    var getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    peer.on("call", function (call) {
      getUserMedia(
        { video: true, audio: true },
        function (stream) {
          call.answer(stream); // Answer the call with an A/V stream.
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            // Show stream in some video/canvas element.
            addVideoStream(video, userVideoStream);
          });
        },
        function (err) {
          console.log("Failed to get local stream", err);
        }
      );
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

peer.on("open", (id) => {
  //generates unique id
  console.log(id);
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  console.log("35script.js", userId);
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

let text = $("input");
// when press enter send message
$("html").keydown(function (e) {
  if (e.which == 13 && text.val().length !== 0) {
    console.log("dw", text.val());
    socket.emit("message", text.val());
    text.val("");
  }
});

socket.on("createMessage", (message) => {
  console.log("from server", message);
  $(".messages").append(
    `
      <li class="message">
        <b>user</b>
        <br />
        ${message}
      </li>`
  );
  scrollToBottom();
});

const scrollToBottom = () => {
  let d = $(".main_chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

//mute out video
const muteUnmute = () => {
  console.log(myVideoStream);
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  console.log("object");
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main_mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main_mute_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main_video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main_video_button").innerHTML = html;
};
