import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDiscrepancies } from "../actions/discrepancyActions";

export default function useDiscrepancies() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.discrepancies);

  useEffect(() => { dispatch(fetchDiscrepancies()); }, [dispatch]);

  return { list, loading };
}
