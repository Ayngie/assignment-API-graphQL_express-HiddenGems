// BOILER PLATE

let hiddenGemsList = [];

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

const getAllHiddenGemsQuery = `query getAllHiddenGems {
  getAllHiddenGems {
    name
    description
    id
  }
}`; //Denna syntax kan man hitta (och copy-pastea om man vill) i sin graphql playground på apollo server (om man inte kan det i huvudet).

const getListButton = document.getElementById("getListBtn");
getListButton.addEventListener("click", async () => {
  const response = await graphQlQuery(
    "http://localhost:5000/graphql",
    getAllHiddenGemsQuery
  );

  console.log(response);

  hiddenGemsList = response.getAllHiddenGems;

  createHTML(hiddenGemsList);
});

function createHTML(hiddenGemsList) {
  let listContainer = document.getElementById("listContainer");

  listContainer.innerHTML = "";

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

// const createHiddenGemQuery = `mutation CreateHiddenGem($name: String!, $description: String) {
//   createHiddenGem(name: $name, description: $description) {
//       name
//       description
//       id
//   }
// }`;

// const createHiddenGemQueryVars = {
//   name: "Visby",
//   description: "Rosornas stad",
// };

// const submitForm = document.querySelector("#submitForm");

// submitForm.addEventListener("click", async (e) => {
//   e.preventDefault();
//   //const response = await graphQlQuery('/graphql', createProjectQuery, createProjectQueryVars)

//   const response = await fetch("/graphql", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       query: `mutation CreateHiddenGem($name: String!) {
//               createHiddenGem(name: $name) {
//                   name
//                   description
//                   id
//               }
//           }`,
//       variables: {
//         name: "Visby",
//       },
//     }),
//   });

//   const data = await response.json();

//   console.log(data); //denna la jag till
//   console.log(response);
// });
