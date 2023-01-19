/* SubmitGraphQLTest */
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

const createHiddenGemQuery = `mutation CreateHiddenGem($name: String!, $description: String) {
    createHiddenGem(name: $name, description: $description) {
        name
        description
        id
    }
}`;

const createHiddenGemQueryVars = {
  name: "Visby",
  description: "Rosornas stad",
};

const submitForm = document.querySelector("#submitForm");

submitForm.addEventListener("click", async (e) => {
  e.preventDefault();
  //const response = await graphQlQuery('/graphql', createProjectQuery, createProjectQueryVars)

  const response = await fetch("/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `mutation CreateHiddenGem($name: String!) {
                createHiddenGem(name: $name) {
                    name
                    description
                    id
                }
            }`,
      variables: {
        name: "Visby",
      },
    }),
  });

  const data = await response.json();

  console.log(data); //denna la jag till
  console.log(response);
});
