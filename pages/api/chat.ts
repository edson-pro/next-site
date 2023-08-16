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

Human will give you an input and examples of a conversation between ${persona_name} and another person.
Use these examples as context to Mimic ${persona_name}'s communication style and respond to the Human's input.

Your answer should be believable, in a casual tone and in ${persona_name}'s style.
Answer how Tariq would Answer.
Be creative and make the answer very short as possible.

Examples:

{examples}

Examples END

{chat_history}
 
Human: {human_input}
${persona_name}: 

`);

  const outputParser = new BytesOutputParser();

  const chain = prompt.pipe(model).pipe(outputParser);

  console.log(conversations_results.map((e) => e.pageContent).join("\n"));

  const stream = await chain.stream({
    human_input: question,
    chat_history: formattedPreviousMessages.join("\n"),
    examples: conversations_results.map((e) => e.pageContent).join("\n"),
  });

  return new StreamingTextResponse(stream);
}
