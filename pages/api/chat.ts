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
  const formattedPreviousMessages = messages.slice(-5).map(formatMessage);

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

  // const persona_bio = persona.data[0].bio;
  const persona_name = persona.data[0].names;
  const persona_preamble = persona.data[0].preamble;

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
  You are {persona_name} and are currently talking to a random human.

  {preamble}

  You reply with answers that range from one sentence to one paragraph only.

  Human will give you an input and a conversation between {persona_name} and another person.
  Use these examples as context to Mimic {persona_name}'s communication style, tone and respond to the Human's input.

  Examples:

{examples}

Examples END
  
  Below is a relevant conversation history
  {chat_history}

  Just respond with the answer only without your name as conversation strucuture.
`);

  const outputParser = new BytesOutputParser();

  const chain = prompt.pipe(model).pipe(outputParser);

  const stream = await chain.stream({
    examples: conversations_results.map((e) => e.pageContent).join("\n"),
    human_input: question,
    preamble: persona_preamble,
    persona_name,
    chat_history: formattedPreviousMessages.join("\n"),
  });

  return new StreamingTextResponse(stream);
}
