import { Navigate, useParams } from "react-router-dom";
import { getOwnersById } from "../../api/OwnerAPI";
import { useQuery } from "@tanstack/react-query";
import EditOwnerform from "../../components/owners/EditOwnerform";

export default function EditOwnerView() {
  const params = useParams();
  const ownerId = params.ownerId!;

const { data, isLoading, isError } = useQuery({
    queryKey: ["editOwners", ownerId],
    queryFn:() => getOwnersById(ownerId),
   retry: false,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <Navigate to='/404'/>;
  }


 if(data) return <EditOwnerform data={data} ownerId={ownerId}/>;
}
