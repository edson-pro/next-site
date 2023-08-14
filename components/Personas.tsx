import supabase from "@/config/supabase";
import Link from "next/link";
import { useQuery } from "react-query";

export default function Personas() {
  const loader = async () => {
    const { data, error } = await supabase.from("personas").select();
    if (error) throw error;
    return data;
  };

  const { data, status } = useQuery("personas", loader, {
    staleTime: Infinity,
  });

  return (
    <div className="p-6">
      <h4 className="font-semibold text-lg mb-2">Personas</h4>
      {status === "loading" && (
        <div className="text-sm border border-slate-200 px-3 py-2 max-w-2xl  p-3 font-medium">
          Loading...
        </div>
      )}
      {status === "error" && (
        <div className="text-sm border border-slate-200 px-3 py-2 max-w-2xl  p-3 font-medium">
          An error has occurred
        </div>
      )}
      <div>
        {status === "success" && (
          <>
            {data?.map((persona) => (
              <Link
                href={`/personas/${persona.id}`}
                key={persona.id}
                className="max-w-md p-4 flex flex-col hover:bg-gray-700 cursor-pointer rounded-md  border border-slate-700 space-y-2"
              >
                <img
                  className="h-14 bg-cover w-14 rounded-full"
                  src={persona.photo}
                  alt=""
                />
                <h5 className="text-base font-semibold">{persona.names}</h5>
                <p className="text-sm line-clamp-3 leading-7 font-medium text-slate-300">
                  {persona.bio}
                </p>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
