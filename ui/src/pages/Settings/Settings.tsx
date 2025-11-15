import React from "react";
import StatRow from "../../components/StatRow";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useManagerDetails } from "../../features/manager/hooks";

export default function Settings() {
    const { data: managerDetails, isLoading, isSuccess } = useManagerDetails();  
  
  return (
    <div className="p-6 border-b border-light-border dark:border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-4xl font-bold">Hi, {managerDetails?.team}</h2>
      </div>

      <div className="space-y-3 mb-4">
        <StatRow
          textSize="text-3xl"
          label="Managers"
          value={""}
          border={false}
        />
        {managerDetails?.managers.split(',').map((val) => ( <StatRow
          textSize="text-xl"
          label={val}
          value={""}
          border={false}
        />))}
       
        {/* <StatRow
          textSize="text-xl"
          label="Password"
          value={"Click to change"}
          border={false}
        /> */}
      </div>
      <div className="flex items-center justify-between mt-4 mb-4">
        <h2 className="text-2xl font-bold">Appearance</h2>
      </div>

      <div className="space-y-3">
        <div
          className={`flex items-center justify-between`}
        >
          <p>{"Theme"}</p>
          <div className="flex items-center gap-3">
            <p className="font-semibold">
              <ThemeToggle />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
