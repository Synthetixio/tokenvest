import { useState, useEffect } from "react";
import { Spinner } from "@chakra-ui/react";
import Grants from "./Grants";
import TokenBalance from "./TokenBalance";
import RecentActivity from "../../shared/RecentActivity";
import { useRecoilState } from "recoil";
import { getGrants, fetchGrants } from "../../../lib/store/grants";
import { eventsState, fetchEvents } from "../../../lib/store/events";

export default function AdminPanel() {
  const [grants, setGrant] = useRecoilState(getGrants());
  const [events, setEvents] = useRecoilState(eventsState);
  const [loadingData, setLoadingData] = useState(true);
  const { chain } = useNetwork();
  const networkId = chain.id;

  useEffect(() => {
    if (!networkId) return;
    Promise.all([
      fetchEvents(setEvents, networkId),
      fetchGrants(setGrant, networkId),
    ]).finally(() => {
      setLoadingData(false);
    });
  }, [networkId]);

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
