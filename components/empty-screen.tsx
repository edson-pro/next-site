import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@/components/ui/icons";

export function EmptyScreen({ setInput, persona }: any) {
  const exampleMessages = persona.suggestions.map((suggestion: any) => ({
    heading: suggestion,
    message: suggestion,
  }));

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Hey there I'am {persona.names}
        </h1>
        <p className="mb-2 leading-7 line-clamp-4 text-muted-foreground">
          {persona.bio}
        </p>
        <p className="leading-7 font-semibold text-base mt-7  text-white">
          You can start a conversation with {persona.names} here or try the
          following questions.
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
