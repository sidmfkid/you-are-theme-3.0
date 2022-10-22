const registerForm = [
  document.getElementById("firstName"),
  document.getElementById("lastName"),
  document.getElementById("email"),
  document.getElementById("password"),
];

const submitButton = document.getElementById("registerSubmit");
if (
  !registerForm[0].value ||
  !registerForm[1].value ||
  !registerForm[2].value ||
  !registerForm[3].value
) {
  submitButton.setAttribute("disabled", true);
}

registerForm.forEach((el) => {
  el.addEventListener("change", handleLoginFormChange.bind(this));
  el.addEventListener("blur", handleLoginFormChange.bind(this));
});

function handleLoginFormChange(e) {
  checkRequiredFields();
  let targetNameError = e.target.name.slice(9, -1) + "-error";
  let targetNameSuccess = e.target.name.slice(9, -1) + "-success";
  console.log(e.target.name.slice(9, -1), targetNameError);
  console.log(e.target.name.slice(9, -1), targetNameSuccess);
  const successEl = document.getElementById(targetNameSuccess);
  const errorEl = document.getElementById(targetNameError);

  if (e.target.value && !e.target.name.includes("password")) {
    successEl.classList.add("show");
    errorEl.classList.remove("show");
  }
  if (!e.target.value && !e.target.name.includes("password")) {
    errorEl.classList.add("show");
    successEl.classList.remove("show");
  }

  if (e.target.value.length >= 8 && e.target.name.includes("password")) {
    successEl.classList.add("show");
    errorEl.classList.remove("show");
  }
  if (e.target.value.length < 8 && e.target.name.includes("password")) {
    successEl.classList.remove("show");
    errorEl.classList.add("show");
  }

  if (e.target.value.length === 0 && e.target.name.includes("password")) {
    console.log(e.target.value);
    successEl.classList.remove("show");
    errorEl.classList.remove("show");
  }
}

function checkRequiredFields() {
  if (
    registerForm[0].value &&
    registerForm[1].value &&
    registerForm[2].value &&
    registerForm[3].value
  ) {
    submitButton.removeAttribute("disabled");
  } else {
    submitButton.setAttribute("disabled", true);
  }
}
