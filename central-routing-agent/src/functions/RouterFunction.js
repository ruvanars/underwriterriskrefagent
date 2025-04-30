const { app } = require('@azure/functions');
const axios = require("axios");

app.http('RouterFunction', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        console.log(`I am in router function`);
        //context.log(`Http function processed request for url "${request.url}"`);

        //const name = request.query.get('name') || await request.text() || 'world';
        const response = await axios.post("http://localhost:4001/api/check-quote", request);
        
        //const response = "The document confirms coverage for fire and flood. According to the policy, a deductible of ₹1,50,000 is allowed for fire damage. Given the client's excellent history and credit rating, approving this deductible seems justified.";

        return { body: response };
    }
});
