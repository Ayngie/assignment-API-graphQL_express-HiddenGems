let hiddenGemsList = [];

window.onload = function () {
  handleGetListButtonClick();
  handleHideListButtonClick();
  handleSubmit();
};

/*-------------------------------------------- BOILER PLATE ---------------------------------------------*/

//för vår fetch
//graphQlQuery är ju en async function helt enkelt som vi skickar in olika parametrar in beroende på om vi vill göra en query eller mutation?
//Syfte:låter oss återanvända fetch lättare  //koden för att göra vår fetch för att sen kunna bara skicka in en variabel
const graphQlQuery = async (url, query, variables = {}) => {
  //url till servern där vi har vårt graphql api (skapat av vår apollo server (verktyg) //parametrar som måste heta så här iom bodyn innehåll nedan
  const response = await fetch(url, {
    method: "POST", //vi gör alltid postrequest till ett graphql-api //kan därav ha reusable function //syntax för detta finns i en slide från lektion i v.2
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query, //utbytbart för olika requests
      variables, //utbytbart för olika requests
    }),
  });

  const res = await response.json();
  return res.data;
};

/*-------------------------------------------- FÖR QUERY ---------------------------------------------*/

//Syfte: se nedan
//Vi skapar en query-variabel som innehåller typ syntax för hur en query ser ut i apollo server - och som matchar vår query i vårt schema
//Denna syntax kan man hitta (och copy-pastea om man vill) i sin graphql playground på apollo server (om man inte kan det i huvudet).
//textsträng som skickas till graphql för tolkning - följer därav syntax
//1. query - vi ska göra en query, -optional att skriva getAllHiddenGems efter, som samlingsnamn för queries i bodyn
//2. andra getAllHiddenGems är namnet på resolvern vi vill ha
//3. fälten vi vill ha tillbaka
const getAllHiddenGemsQuery = `query getAllHiddenGems {
    getAllHiddenGems {
      name
      description
      id
    }
  }`;

async function handleGetListButtonClick() {
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

/*-------------------------------------------- FÖR MUTATION ---------------------------------------------*/

//Syfte: se nedan
//Vi skapar en query-variabel som innehåller typ syntax för hur en query ser ut i apollo server - och som matchar vår query i vårt schema
//Denna syntax kan man hitta (och copy-pastea om man vill) i sin graphql playground på apollo server (om man inte kan det i huvudet).
//textsträng som skickas till graphql för tolkning - följer därav syntax
//Nu vill vi göra en mutation, sen har vi samlingsnamnet, sen paranteser m in-parametrar, sen matchar vi dem -
//- skickar in ett js objekt som matchar - dollartecknet är framför det variabelnamn vi måste använda (ett sätt för graphql att skilja variabelnamnet från annat).
//sen skickar vi med objektet... matchar schemat.
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

const deleteHiddenGemQuery = `mutation DeleteHiddenGem($gemId: ID!) {
  deleteHiddenGem(gemId: $gemId) {
    deletedId
    success
  }
}`;

async function deleteHiddenGem(id) {
  //här döper jag om gemId till id så att det matchar vad id heter i queryn för getAllHiddenGems.
  const response = await graphQlQuery(
    "http://localhost:5000/graphql",
    deleteHiddenGemQuery,
    {
      gemId: id, //här måste detta heta id iom det heter så i query syntaxen.
    }
  );
  console.log(response);
  getList(); //anrop av asynk funktion (som ska invänta api med data, o sen den skapa ny html);
}

async function getList() {
  const response = await graphQlQuery(
    "http://localhost:5000/graphql",
    getAllHiddenGemsQuery
  );

  console.log(response);

  hiddenGemsList = response.getAllHiddenGems;

  createHTML(hiddenGemsList);
}

/*-------------------------------------------- FÖR HTML ---------------------------------------------*/

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
    let deleteBtn = document.createElement("button");

    container.classList.add("hiddenGem");
    container.classList.add("form-control");
    name.className = "hiddenGem__Name";
    description.className = "hiddenGem__Description";
    deleteBtn.classList.add("deleteBtn");
    deleteBtn.setAttribute("type", "button");
    // deleteBtn.setAttribute("id", "submitForm");

    name.innerHTML = hiddenGemsList[i].name;
    description.innerHTML = hiddenGemsList[i].description;
    deleteBtn.innerHTML = "Ta bort";

    deleteBtn.addEventListener("click", () => {
      deleteHiddenGem(hiddenGemsList[i].id);
    });

    container.appendChild(name);
    container.appendChild(description);
    container.appendChild(deleteBtn);
    listContainer.appendChild(container);
  }
}

//Funktion för att dölja listan igen
function handleHideListButtonClick() {
  const hideListBtn = document.getElementById("hideListBtn");

  hideListBtn.addEventListener("click", async () => {
    location.reload(); //Laddar om sidan så att listan automatiskt döljs (inkl sortBtn)
  });
}

//Funktion för att sortera listan
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

/*-----------------------------------------------------------------------------------------*/
