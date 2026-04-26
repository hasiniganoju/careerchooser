document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const interest = document.getElementById("interest").value;
  const skill = document.getElementById("skill").value;
  const goal = document.getElementById("goal").value;

  document.getElementById("result").innerText = "Generating...";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer YOUR_API_KEY_HERE",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: `Interest: ${interest}, Skill: ${skill}, Goal: ${goal}.
Suggest career path, roadmap, projects and backup options.`
          }
        ]
      })
    });

    const data = await res.json();
    document.getElementById("result").innerText =
      data.choices[0].message.content;

  } catch (err) {
    document.getElementById("result").innerText =
      "Error connecting to AI";
  }
});
