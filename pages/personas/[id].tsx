import supabase from "@/config/supabase";
import React from "react";
import { useQuery } from "react-query";
import { useState } from "react";
import { useRouter } from "next/router";
import { Chat } from "@/components/chat";

export default function Persona() {
  const router = useRouter();

  const loader = async () => {
    const { data, error } = await supabase
      .from("personas")
      .select()
      .eq("id", router.query.id)
      .single();
    if (error) throw error;
    return data;
  };

  const [value, setvalue] = useState("");

  const { data, status } = useQuery(["personas", router.query.id], loader, {
    enabled: !!router.query.id,
  });
  return (
    <>{status === "success" && data && <Chat persona={data} id={data.id} />}</>
  );
}
