import { GoogleVertexAIEmbeddings } from "@langchain/community/embeddings/googlevertexai";
import { GoogleAuth } from 'google-auth-library';

const run = async () => {

    const auth = new GoogleAuth({
        scopes: 'https://www.googleapis.com/auth/cloud-platform',
        projectId: 'gen-lang-client-0413339354', // <-- Replace with your actual project ID
    });
    const client = await auth.getClient();

    const model = new GoogleVertexAIEmbeddings({
        authClient: client
    });

    const res = await model.embedQuery(
        "What would be a good company name for a company that makes colorful socks?"
    );

    console.log(res);
};

run();