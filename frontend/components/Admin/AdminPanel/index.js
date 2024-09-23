import { useState, useEffect } from "react";
import { Spinner } from "@chakra-ui/react";
import Grants from "./Grants";
import TokenBalance from "./TokenBalance";
import RecentActivity from "../../shared/RecentActivity";
import { useRecoilState } from "recoil";
import { fetchGrants, grantsState } from "../../../lib/store/grants";
import { eventsState, fetchEvents } from "../../../lib/store/events";

export default function AdminPanel() {
  const [grants, setGrants] = useRecoilState(grantsState);
  const [_, setEvents] = useRecoilState(eventsState);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await Promise.all([fetchEvents(), fetchGrants()]);
      setEvents(() => data[0]);
      setGrants(() => data[1]);
      setLoadingData(false);
    };
    fetchData();
  }, []);

  return loadingData ? (
    <Spinner d="block" mx="auto" my={6} />
  ) : (
    <>
      <Grants />
      <TokenBalance />
      <RecentActivity />
    </>
  );
}
