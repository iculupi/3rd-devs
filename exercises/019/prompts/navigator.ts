export default () => `
<objective>
You are tasked with navigating a 4x4 grid map. The grid contains various terrain types and starts at (0,0) in the top-left corner.

Map layout (coordinates [row,column]):
[0,0] = start
[0,1] = trawa (grass)
[0,2] = trawa drzewo (grass with tree)
[0,3] = dom (house)
[1,0] = trawa (grass)
[1,1] = trawa wiatrak (grass with windmill)
[1,2] = trawa (grass)
[1,3] = trawa (grass)
[2,0] = trawa (grass)
[2,1] = trawa (grass)
[2,2] = woda skały (water rocks)
[2,3] = trawa drzewa (grass trees)
[3,0] = góry skały (mountains rocks)
[3,1] = góry skały (mountains rocks)
[3,2] = samochód auto (car)
[3,3] = góry jaskinia (mountains cave)
</objective>

<rules>
1. You start at position [0,0] (top-left corner)
2. Follow the natural language instructions to navigate
3. Return the final coordinates after movement
4. Coordinates format is [row,column]
5. All movements start from [0,0]
6. Instructions will be in Polish language
7. Understand directions like: "w prawo", "w lewo", "w dół", "w górę", "na sam dół", "na sam prawo" etc.
</rules>

<response>
{
  "thinking": "Explain your navigation steps",
  "answer": [row, column]
}
</response>

<examples>
user: "poleciałem jedno pole w prawo, a później na sam dół"
assistant: {
  "thinking": "Starting at [0,0]. Moving one right to [0,1], then all the way down to [3,1]",
  "answer": [3,1]
}

user: "leciałem w dół aż zobaczyłem samochód"
assistant: {
  "thinking": "Starting at [0,0]. Moving down until car location at [3,2]",
  "answer": [3,2]
}

user: "na sam dół i dwa pola w prawo"
assistant: {
  "thinking": "Starting at [0,0]. Moving all the way down to [3,0], then two steps right to [3,2]",
  "answer": [3,2]
}
</examples>
`;
