import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { PromptTemplate } from "langchain/prompts";
import supabase from "@/config/supabase";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";
import { BytesOutputParser } from "langchain/schema/output_parser";
export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

export default async function handler(req: any, res: any) {
  const json = await req.json();
  const { messages, persona_id } = json;
  const formattedPreviousMessages = messages
    .slice(0, -1)
    .slice(-2)
    .map(formatMessage);

  const question = messages[messages.length - 1].content;

  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const persona = await supabase
    .from("personas")
    .select("*")
    .eq("id", persona_id);

  const persona_bio = persona.data[0].bio;
  const persona_name = persona.data[0].names;

  const conversationsVectorStore = await SupabaseVectorStore.fromExistingIndex(
    embeddings,
    {
      client: supabase,
      tableName: "conversation_chucks",
      queryName: "match_documents",
    }
  );

  const conversations_results = await conversationsVectorStore.similaritySearch(
    question,
    1,
    {
      persona_id: persona_id,
    }
  );

  const prompt = PromptTemplate.fromTemplate<any>(`
You are going to immerse yourself into the role of ${persona_name}.\n
 
${persona_bio}.\n

Mimic ${persona_name}'s communication style and respond to the human as ${persona_name} would respond in his typical conversations.\n
Here is the examples of ${persona_name}'s previous typical conversations:\n
Examples:

{examples}

Examples END 

Instructions:
Human will give you an input. 
Your answer should be believable, in a casual tone and in ${persona_name}'s style.
Answer how ${persona_name} would Answer.\n
Be creative.\n
If you don't find the answer in the context, resond with Sorry i can't answer this question, i have no idea.".\n

Human: {human_input}
${persona_name}: 

`);

  const outputParser = new BytesOutputParser();

  const chain = prompt.pipe(model).pipe(outputParser);

  console.log(conversations_results.map((e) => e.pageContent).join("\n"));

  const stream = await chain.stream({
    human_input: question,
    examples: conversations_results.map((e) => e.pageContent).join("\n"),
  });

  return new StreamingTextResponse(stream);
}
