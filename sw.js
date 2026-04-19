self.addEventListener("push", function(event) {
  const data = event.data ? event.data.text() : "Reminder";

  self.registration.showNotification("Carely", {
    body: data,
    icon: "icon.png"
  });
});
