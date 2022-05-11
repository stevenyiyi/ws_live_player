import "./styles.css";
document.getElementById("app").innerHTML = `
<h1>Hello Vanilla!</h1>
<div>
  We use the same configuration as Parcel to bundle this sandbox, you can find more
  info about Parcel 
  <p id="idts">Current time is:</p>
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
</div>
`;
let t = document.getElementById("idts");
t.innerHTML += window.performance.timeOrigin;
