import { UseChatHelpers } from "ai/react";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "@/components/external-link";
import { IconArrowRight } from "@/components/ui/icons";

const exampleMessages = [
  {
    heading: "Who are you?",
    message: `Who are you?`,
  },
  {
    heading: "Introduce your self",
    message: "Introduce your self",
  },
];

export function EmptyScreen({ setInput, persona }: any) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">{persona.names}</h1>
        <p className="mb-2 leading-7 line-clamp-5 text-muted-foreground">
          {persona.bio}
        </p>
        <p className="leading-7 text-muted-foreground">
          You can start a conversation with {persona.name} here or try the
          following examples:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
