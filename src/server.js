require("dotenv").config(); // Enables Node to be able to read our .env variables
const { ApolloServer } = require("@apollo/server"); //import av modulen apollo server
const { resolvers } = require("./resolvers"); //importerar våra resolvers
const { loadFiles } = require("@graphql-tools/load-files");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const path = require("path"); //import av inbyggd modul i node.
// const { startStandaloneServer } = require('@apollo/server/standalone') //kommenterar bort iom anv expressMiddleware ist för apollo.
const { expressMiddleware } = require("@apollo/server/express4"); //importera middleware: istället för startstandalone server importerar vi nu express middleware
const express = require("express"); //import av modulen express

const app = express(); //Gör en applikation av express. //Med detta kapar express en serverapplikation som vi kan använda. (Den kommer vi sätta upp så den kan lyssna på våra requests).

/*Nu kommer vår middleware:*/ //Varför alla dessa middleware: för att kunna kolla o göra alla saker innan man ska skriva logiken för att kunna skicka en response.
app.use(express.json()); //Inbyggd express middleware för att översätta JSON till JS.

//NU SKA SERVERN SKICKA TILLBAKA HTML OCH JS FILER //ETT sätt att hämta FrontEnd och visa upp det i vår domän! //SÅ VI KAN HA (FRONTEND app + BACKEND ) på samma SERVER (vår domän / vår localport). //skicka tillbaka dessa filer är det vi säger.
app.use(express.static(path.join(__dirname, "public"))); // gör filerna i mappen public (assets, tex css, images, js) tillgängliga i browsern. //Vi återskapar en directory filestructure direkt på siten, när vi sätter en directory som statisk. // express.static- med detta kan vi säga till att mapp + fil struktur ska återskapas på vår webbsida/domän. //Säger att den här mappen/filen som vi skapar en path till - den ska bara skicka tillbaka (leverera) statiska filer. Allt i public ska skickas tillbaka, samt allt i views likaså, så att vi har tillgång till dem när vi gör våra requests.
app.use(express.static(path.join(__dirname, "views"))); // gör filerna i mappen views (html) tillgängliga i browsern.
//-->Nu om vi öppnar upp localhost få vi en sida att titta på. Det skapas där en url-struktur utifrån våra mappar+filer (den strukturen). //Om det då är en mapp tex projects och det däri ligger en index.html fil - då kan vi bara navigera till ...../views/projects och så kommer webbläsaren automatiskt läsa in indexfilen. Det är kodat på ngt sätt så det funkar så om en fil heter index.

const port = process.env.PORT || 5000; //På antingen localhost angiven i variabeln PORT i .env-filen || localhost:5000 kommer man med en '/' kunna gå till våra statiska filer. //det första i denna || är om vi har en variabel PORT i .env som konstaterar en localport, tex, att det där står att localport ska vara 4000.

//Vi har en function run pga vi behöver använda await.
async function run() {
  try {
    // Loads our schema.graphql file and reformats it for use in the next step // Här pekar vi på vår faktiska schema.graphql-fil, och loadfiles läser av den.
    const typeDefs = await loadFiles(path.join(__dirname, "schema.graphql"));
    // Creates a schema from our typeDefs (see step above) and our resolvers // Det skapas ett schema som vår apollo server kan läsa så vi ska kunna starta vår apollo server. Alltså, vår schema.graphql-fil SAMT våra resolvers görs om till ngt (ett schema) som kan användas i apollo server.
    const schema = makeExecutableSchema({
      typeDefs: typeDefs,
      resolvers: resolvers,
    });
    // Creates a GraphQL server from our schema
    const server = new ApolloServer({ schema: schema }); //skapar vår apolloserver och skickar in nyss nämnda skapade schema.
    // Starts the apollo server in
    // const res = await startStandaloneServer(server) //Kommenterar bort detta när vi använder express, och bara awaitar att graphql server ska startas upp.
    // console.log(`🚀 Server ready at ${res.url}`)
    await server.start(); //awaitar att graphql server ska startas upp

    app.use("/graphql", expressMiddleware(server)); //Vi vill att appen ska hitta till vår graphql (apollo) server när vi går till följande adressändelse (dvs /graphql). //Denna körs bara på localhost, datorn vet det, den kommer lägga till localhost innan /graphql. //graphql har inte med vår fil att göra, detta har bara att göra med denna som url.

    /* middleWare är klart, NU ska vi STARTA upp och LYSSNA på servern: */ //FRÅGA: lyssnar vi på express servern här? Eller apollo?
    app.listen(port, () => {
      console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
    });
  } catch (error) {
    console.error(error);
  }
}

run();
