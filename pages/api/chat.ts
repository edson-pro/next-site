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
    openAIApiKey: "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",
  });

  const persona = await supabase
    .from("personas")
    .select("*")
    .eq("id", persona_id);

  const persona_bio = persona.data[0].bio;
  const persona_name = persona.data[0].names;

  const vectorStore = await SupabaseVectorStore.fromExistingIndex(
    new OpenAIEmbeddings({
      openAIApiKey: "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",
    }),
    {
      client: supabase,
      tableName: "conversation_chucks",
      queryName: "match_documents",
    }
  );

  const results = await vectorStore.similaritySearch(question, 1, {
    persona_id: persona_id,
  });

  const prompt = PromptTemplate.fromTemplate<any>(`
You are going to immerse yourself into the role of ${persona_name}.\n
Who is ${persona_name}?
${persona_bio}.\n

Instructions:
Human will give you an input and examples of a conversation between ${persona_name} as a character and the interviewer.
Use these examples as context to generate an answer to the Human's input in ${persona_name}'s style.
Your answer should be believable, in a casual tone and in ${persona_name}'s style.
Answer how ${persona_name} would Answer.\n
Be creative.\n
The answer should be as short as possible short.\n

if you don't realy know what to answer, just respond as how ${persona_name} would respond if he/her does not have the answer".\n


Examples:

{examples}

Examples END

Human: {human_input}
${persona_name}: 

`);

  console.log(persona_name);
  const outputParser = new BytesOutputParser();

  const chain = prompt.pipe(model).pipe(outputParser);

  const stream = await chain.stream({
    human_input: question,
    chat_history: formattedPreviousMessages.join("\n"),
    examples: results.map((e) => e.pageContent).join("\n\n"),
  });

  return new StreamingTextResponse(stream);
}
