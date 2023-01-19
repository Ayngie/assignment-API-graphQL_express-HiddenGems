// BOILER PLATE

let hiddenGemsList = [];

window.onload = function () {
  handleButtonClick();
  handleSubmit();
};

//Syfte:
const graphQlQuery = async (url, query, variables = {}) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const res = await response.json();
  return res.data;
};

//FÖR QUERY
//Syfte:
//Vi skapar en query-variabel som innehåller typ syntax för hur en query ser ut i apollo server - och som matchar vår query i vårt schema
//Denna syntax kan man hitta (och copy-pastea om man vill) i sin graphql playground på apollo server (om man inte kan det i huvudet).
const getAllHiddenGemsQuery = `query getAllHiddenGems {
    getAllHiddenGems {
      name
      description
      id
    }
  }`;

async function handleButtonClick() {
  // Nu hämtar vi o lyssnar på knappen som ska visa listan, och inne i anonyma funktionen på vår addEventListener:
  // - awaitar vi inbyggda funktionen graphQLQuery (och skickar med url:en, samt query-variabeln vi nyss skapade.
  // - vi skapar även en variabel för att fånga upp ett objekt i vår response, nämligen listan vi får tillbaka
  // - Sist så anropar vi createHTML med denna lista.
  const getListBtn = document.getElementById("getListBtn");

  getListBtn.addEventListener("click", async () => {
    const response = await graphQlQuery(
      "http://localhost:5000/graphql",
      getAllHiddenGemsQuery
    );

    // console.log(response);

    hiddenGemsList = response.getAllHiddenGems;

    createHTML(hiddenGemsList);
  });
}

// Vi skapar sen upp detta i html med en "vanlig" createHTML funktion:
function createHTML(hiddenGemsList) {
  let listContainer = document.getElementById("listContainer");

  listContainer.innerHTML = "";

  let sortBtn = document.createElement("button");
  sortBtn.innerHTML = "Sortera A-Z";
  sortBtn.classList.add("sortBtn");
  sortBtn.classList.add("btn", "btn-light");
  sortBtn.addEventListener("click", () => {
    sortToDoListByABC(hiddenGemsList);
  }); //hämtar knappen för att sortera listitems i alfabetisk ordning, lyssnar på den, för att vid klick ->anropa funktion sortTodoList.
  listContainer.appendChild(sortBtn);

  for (let i = 0; i < hiddenGemsList.length; i++) {
    let container = document.createElement("div");
    let name = document.createElement("p");
    let description = document.createElement("p");

    container.classList.add("hiddenGem");
    container.classList.add("form-control");
    name.className = "hiddenGem__Name";
    description.className = "hiddenGem__Description";

    name.innerHTML = hiddenGemsList[i].name;
    description.innerHTML = hiddenGemsList[i].description;

    container.appendChild(name);
    container.appendChild(description);
    listContainer.appendChild(container);
  }
}

//FÖR MUTATION
//Syfte:
//Vi skapar en query-variabel som innehåller typ syntax för hur en query ser ut i apollo server - och som matchar vår query i vårt schema
//Denna syntax kan man hitta (och copy-pastea om man vill) i sin graphql playground på apollo server (om man inte kan det i huvudet).
const createHiddenGemQuery = `mutation CreateHiddenGem($input: CreateHiddenGemInput!) {
  createHiddenGem(input: $input) { 
    name
    description
    id
  }
}`;

async function handleSubmit() {
  //vi lyssnar på knappen för att submit:a formuläret.
  const submitForm = document.querySelector("#submitForm");

  submitForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = e.target.querySelector("#addNameTextBox").value; //Petters lösning. Röd squiggly pga typescript checker säger är fel, men funkar i JS. //OBS! SKulle EJ gå att kompilera!
    const description = e.target.querySelector("#addDescriptionTextBox").value; //Petters lösning. Röd squiggly pga typescript checker säger är fel, men funkar i JS. //OBS! SKulle EJ gå att kompilera!
    // console.log(name);
    // console.log(description);

    const response = await fetch("/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: createHiddenGemQuery, //säger vad jag vill att graphql ska göra
        variables: {
          //matchar min apollo server variable
          input: {
            name: name,
            description: description,
          },
        },
      }),
    });

    const data = await response.json();
    // console.log(data);

    //Lägga till på listan och uppdatera html

    //Rensa inputs
    e.target.querySelector("#addNameTextBox").value = ""; //Petters lösning. Röd squiggly pga typescript checker säger är fel, men funkar i JS. //OBS! SKulle EJ gå att kompilera!
    e.target.querySelector("#addDescriptionTextBox").value = ""; //Petters lösning. Röd squiggly pga typescript checker säger är fel, men funkar i JS. //OBS! SKulle EJ gå att kompilera!

    //Skapa upp nya listan i html
    const newListResponse = await graphQlQuery(
      "http://localhost:5000/graphql",
      getAllHiddenGemsQuery
    );
    // console.log(newListResponse);

    let newHiddenGemsList = newListResponse.getAllHiddenGems;

    createHTML(newHiddenGemsList);
  });
}

function sortToDoListByABC(hiddenGemsList) {
  hiddenGemsList.sort((a, b) => {
    if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    }

    if (a.name.toLowerCase() === b.name.toLowerCase()) {
      return 0;
    } else {
      return +1;
    }
  });

  createHTML(hiddenGemsList);
}
