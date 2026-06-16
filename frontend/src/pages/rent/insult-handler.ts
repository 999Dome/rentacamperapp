import type { InsultResponse } from "@shared/insult.ts";

const button = document.getElementById("insult-btn") as HTMLButtonElement;
const display = document.getElementById("insult-text") as HTMLParagraphElement;

if (button && display) {
  button.addEventListener("click", async () => {
    button.disabled = true;

    try {
      const response = await fetch("http://localhost:3000/insult");

      if (!response.ok) throw new Error("Backend antwortet nicht");

      const data = (await response.json()) as InsultResponse;

      display.innerText = data.insult;
    } catch (error) {
      display.innerText = "Ups da ist etwas schief gelaufen :(";
      console.error(error);
    } finally {
      button.disabled = false;
    }
  });
}
