import React, { useEffect, useState } from "react";
import styles from "./tableView.module.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Label,
  LabelList,
} from "recharts";
import TopNavigationBar from "../components/TopNavigationBar";
import { useMahjongDataStore } from "../store";

import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function BarChartView() {
  const [fetchedData, setFetchedData] = useState(null);
  const [filteredFetchedData, setFilteredFetchedData] = useState(null);
  const [filteredByNameFetchedData, setFilteredByNameFetchedData] =
    useState(null);
  const [chartData, setChartData] = useState(null);

  const [currentSelectedDate, setCurrentSelectedDate] = useState(null);

  useEffect(() => {
    const handleFetchAllData = async () => {
      let { data, error } = await supabase.from("Game_Details").select(`
        "*",
        Score (
          ID, east, south, west, north, Game_Details_ID
        )
      `);
      // console.log(data);
      console.log(error);

      const mappedDateData = data.map((datum) => {
        const newDatum = datum;
        // console.log(55, typeof newDatum.created_at.split("T")[0]);

        newDatum.created_at = newDatum.created_at.split("T")[0];

        return newDatum;
      });
      const filteredData = mappedDateData.filter(
        (datum) => datum.created_at === currentSelectedDate
      );
      console.log(
        "🦆 ~ file: BarChartView.jsx:55 ~ handleFetchAllData ~ filteredData:",
        filteredData
      );
      console.log(
        "🦆 ~ file: BarChartView.jsx:50 ~ mappedDateData ~ mappedDateData:",
        mappedDateData
      );
      let temporaryObject = {};
      filteredData.forEach((datum) => {
        // console.log(datum);
        // console.log(datum.created_at);
        if (!temporaryObject[datum.created_at])
          temporaryObject[datum.created_at] = [];
        temporaryObject[datum.created_at].push(datum.Score[0]);
      });
      console.log(
        "🦆 ~ file: BarChartView.jsx:51 ~ handleFetchAllData ~ temporaryObject:",
        temporaryObject
      );
      // console.log(scoreDataByNameContainer);
      const scoreDataByNameContainer = {};

      temporaryObject[currentSelectedDate]?.forEach((scoreOnThisDate) => {
        if (!scoreDataByNameContainer[scoreOnThisDate.east.name]) {
          scoreDataByNameContainer[scoreOnThisDate.east.name] = [
            scoreOnThisDate.east.points,
          ];
        } else {
          scoreDataByNameContainer[scoreOnThisDate.east.name].push(
            scoreOnThisDate.east.points
          );
        }
        if (!scoreDataByNameContainer[scoreOnThisDate.west.name]) {
          scoreDataByNameContainer[scoreOnThisDate.west.name] = [
            scoreOnThisDate.west.points,
          ];
        } else {
          scoreDataByNameContainer[scoreOnThisDate.west.name].push(
            scoreOnThisDate.west.points
          );
        }
        if (!scoreDataByNameContainer[scoreOnThisDate.south.name]) {
          scoreDataByNameContainer[scoreOnThisDate.south.name] = [
            scoreOnThisDate.south.points,
          ];
        } else {
          scoreDataByNameContainer[scoreOnThisDate.south.name].push(
            scoreOnThisDate.south.points
          );
        }
        if (!scoreDataByNameContainer[scoreOnThisDate.north.name]) {
          scoreDataByNameContainer[scoreOnThisDate.north.name] = [
            scoreOnThisDate.north.points,
          ];
        } else {
          scoreDataByNameContainer[scoreOnThisDate.north.name].push(
            scoreOnThisDate.north.points
          );
        }
      });
      console.log(
        "🦆 ~ file: BarChartView.jsx:68 ~ handleFetchAllData ~ scoreDataByNameContainer:",
        scoreDataByNameContainer
      );

      const chartDataContainer = [];
      for (const scoreBearer in scoreDataByNameContainer) {
        console.log(scoreBearer);
        console.log(scoreDataByNameContainer);
        console.log(scoreDataByNameContainer[scoreBearer]);
        chartDataContainer.push({
          name: scoreBearer,
          points:
            scoreDataByNameContainer[scoreBearer].reduce((a, b) => a + b) /
            scoreDataByNameContainer[scoreBearer].length,
        });
      }
      chartDataContainer.sort(
        (firstElement, secondElement) =>
          secondElement.points - firstElement.points
      );

      setFetchedData([temporaryObject]);
      setCurrentSelectedDate(Object.keys(temporaryObject)[0]);
      setFilteredFetchedData(temporaryObject[currentSelectedDate]);
      setFilteredByNameFetchedData(scoreDataByNameContainer);
      setChartData(chartDataContainer);
    };
    handleFetchAllData().catch(console.error);
  }, [setChartData, setFetchedData, currentSelectedDate]);

  useEffect(() => {
    // console.log(fetchedData);
    // console.log(currentSelectedDate, 88);
    // console.log(filteredFetchedData);
    // console.log(filteredByNameFetchedData);
    // console.log(chartData);
  }, [
    fetchedData,
    currentSelectedDate,
    setFilteredFetchedData,
    filteredByNameFetchedData,
    chartData,
  ]);

  const mapDataClassifiedByDate = useMahjongDataStore(
    ({ mapDataClassifiedByDate }) => mapDataClassifiedByDate
  );
  const allDates = useMahjongDataStore(({ allDates }) => allDates);

  const handleFilterData = (event, filter) => {
    console.log(
      "🦆 ~ file: TableView.jsx:34 ~ handleFilterData ~ event:",
      66,
      event.target.value,
      filter
    );
    if (filter === "date") mapDataClassifiedByDate(event.target.value);
  };

  return (
    <div className="h-screen bg-[#3d476a]">
      <TopNavigationBar
        prop_toLeft={"/table"}
        prop_toRight={"/radar"}
        prop_toLeftText={"< Table"}
        prop_toRightText={"Radar >"}
      />
      <div className="mt-4 text-2xl">{currentSelectedDate}</div>
      <div className={styles.filterText}>Filter by date:</div>
      <select
        className={styles.filterDropDown}
        onChange={(event) => setCurrentSelectedDate(event.target.value)}
      >
        <option value="All">All</option>
        {allDates?.map((datum) => (
          <option value={datum}>{datum}</option>
        ))}
      </select>
      <ResponsiveContainer width="90%" height="80%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          layout={"vertical"}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#000" />
          <XAxis type="number" dataKey="points">
            <Label value="Scores" offset={0} position="insideBottom" />
          </XAxis>
          <YAxis type="category" dataKey="name">
            <Label
              value="List of players"
              offset={0}
              // position="insideLeft"
              position="left"
              angle="-90"
            />
          </YAxis>
          <Tooltip />
          <Legend />
          <ReferenceLine x={0} stroke="#000" />
          <Bar dataKey="points" fill="#b7b7ab">
            <LabelList dataKey="name" position="insideLeft" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
