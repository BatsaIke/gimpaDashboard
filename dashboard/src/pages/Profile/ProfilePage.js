import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./ProfilePage.module.css";
import { fetchMe } from "../../actions/authAction";
import { fetchDepartments } from "../../actions/departmentsActions";
import { fetchUserKpis } from "../../actions/kpiActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import ProfileHero from "./ProfileHero";
import ProfileCard from "./ProfileCard";
import DepartmentsCard from "./DepartmentsCard";
import ListCard from "./ListCard";
import KpiList from "./KpiList";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((s) => s.auth?.user);
  const token = useSelector((s) => s.auth?.token);

  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [kpis, setKpis] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Always refresh /auth/me so we get headOf / supervisorOf / headSubtree
      const meRes = await dispatch(fetchMe());

      // Load scoped departments for ID→object mapping fallback
      const d = await dispatch(fetchDepartments("mine"));
      if (d?.success) setDepartments(d.data || []);

      const meId = meRes?.data?._id || authUser?._id || null;
      if (meId) {
        const k = await dispatch(fetchUserKpis(meId));
        if (k?.success) setKpis(k.kpis || []);
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, token]);

  // Build a map for quick lookup
  const deptMap = useMemo(
    () => new Map(departments.map((d) => [String(d._id), d])),
    [departments]
  );

  // Memberships visible on card (fallback to scoped roots if none on the user doc)
  const myDepartments = useMemo(() => {
    const fromAuth = authUser?.department
      ? Array.isArray(authUser.department)
        ? authUser.department
        : [authUser.department]
      : [];
    const norm = fromAuth
      .map((d) =>
        typeof d === "object"
          ? d
          : deptMap.get(String(d)) || { _id: d, name: String(d) }
      )
      .filter(Boolean);
    return norm.length ? norm : departments.filter((d) => !d.parent);
  }, [authUser, departments, deptMap]);

  // Supervisor list: prefer server-provided objects; fallback to ID mapping
  const supervisorOf = useMemo(() => {
    if (authUser?.supervisorOf?.length) return authUser.supervisorOf;
    const ids = authUser?.supervisedDepartments || [];
    return ids.map((id) => deptMap.get(String(id))).filter(Boolean);
  }, [authUser, deptMap]);

  const headOf = authUser?.headOf || [];
  const headSubtree = authUser?.headSubtree || [];

  if (loading) {
    return (
      <div className={`${styles.pageBg} ${styles.pageShell}`}>
        <div className={styles.loadingBlock}>
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading profile…</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.pageBg} ${styles.pageShell}`}>
      {/* Hero */}
      <ProfileHero
        name={authUser?.fullName || authUser?.username || "Unnamed User"}
        role={authUser?.role}
        rank={authUser?.rank}
      />

      {/* Grid */}
      <main className={styles.grid}>
        {/* Profile */}
        <ProfileCard
          username={authUser?.username}
          fullName={authUser?.fullName}
          email={authUser?.email}
          phone={authUser?.phone}
        />

        {/* Membership */}
        <DepartmentsCard
          title="Departments"
          departments={myDepartments}
          allDepartments={departments}
        />

        {/* Head of */}
        <ListCard
          title="You are Head of"
          emptyMsg="You are not set as Head for any department."
          items={headOf}
        />

        {/* Supervisor of */}
        <ListCard
          title="You are Supervisor of"
          emptyMsg={
            authUser?.isSupervisor
              ? "You’re marked as a supervisor, but no departments are attached yet."
              : "You do not supervise any department."
          }
          items={supervisorOf}
        />

        {/* Head subtree */}
        {headSubtree.length > 0 && (
          <ListCard
            wide
            title="Sub-departments under your Headship"
            emptyMsg=""
            items={headSubtree}
            showTag={false}
          />
        )}

        {/* KPIs */}
        <KpiList kpis={kpis} />
      </main>
    </div>
  );
};

export default ProfilePage;
