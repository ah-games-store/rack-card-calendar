const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

async function getEventData() {
  const data = await fetch(
    "https://docs.google.com/spreadsheets/d/1EIBFkGyl6fIcILwLOopWvbnKt2QVI7sBZ-aBaFIOp8o/gviz/tq"
  );
  const jsonOptional = (await data.text()).match(
    /google\.visualization\.Query\.setResponse\(([\s\S\w]+)\)/
  );
  if (jsonOptional === null && jsonOptional[1] === undefined) {
    throw new Error("No data found");
  }
  const obj = JSON.parse(jsonOptional[1]);
  const table = obj.table;
  const header = table.cols.map(({ label }) => label);
  const rows = table.rows.map(({ c }) => c.map((e) => (e ? e.v || "" : ""))); // Modified from const rows = table.rows.map(({c}) => c.map(({v}) => v));
  const prelimData = [];
  rows.forEach((row) => {
    const data = {};
    header.forEach((key, index) => {
      data[key] = row[index];
    });
    prelimData.push(data);
  });
  console.log(prelimData);
  const finalData = prelimData.map((event) => {
    const eventDate = new Date(
      ...event.Date.replace("Date(", "").replace(")", "").split(",")
    );
    return {
      title: event.Title,
      fullDate: eventDate,
      date: eventDate.getDate(),
      time: eventDate
        .toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        })
        .replace(" ", ""),
      description: event.Description,
      weekday: days[eventDate.getDay()],
      image: event.Image,
      store: event.Store,
      weekly: event.Weekly,
    };
  });
  console.log(finalData);
  return finalData;
}

getEventData().then((events) => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  const month = params.month;
  const store = params.store;
  console.log(month, store);
  if (store == "Ruston") {
    document.getElementById("rack-main").style.backgroundColor = "#74292B";
    document.querySelector(".rack-header").onclick = () => {
      window.location.href = `?store=Monroe&month=${month}`;
    };
  }
  if (store == "Monroe") {
    document.querySelector(".rack-header").onclick = () => {
      window.location. = `?store=Ruston&month=${month}`;
    };
  }

  document.querySelector(
    ".rack-header a"
  ).innerText = `${store} - ${months[month]}`;
  const filteredEvents = events.filter(
    (event) => event.fullDate.getMonth() === month - 1 && event.store === store
  );

  for (const event of filteredEvents.filter((event) => event.weekly !== true)) {
    console.log(event);
    const root = document
      .querySelector("#top-events #root-event")
      .cloneNode(true);
    root.querySelector(".event-title").innerText = event.title;
    root.querySelector(".event-description").innerText = event.description;
    root.querySelector(".event-icon .time").innerText = event.time;
    root.querySelector(".event-icon .date").innerText = event.date;
    root.querySelector(".event-icon .weekday").innerText = event.weekday;
    root.querySelector(".event-icon img").src = event.image;

    document.getElementById("top-events").appendChild(root);
  }

  for (const event of filteredEvents.filter((event) => event.weekly === true)) {
    console.log(event);
    const root = document
      .querySelector("#top-events #root-event")
      .cloneNode(true);
    root.querySelector(".event-title").innerText = event.title;
    root.querySelector(".event-description").innerText = event.description;
    root.querySelector(".event-icon .time").innerText = event.time;
    root.querySelector(".event-icon .date").innerText = event.weekday.slice(
      0,
      3
    );
    root.querySelector(".event-icon .weekday").innerText = "";
    root.querySelector(".event-icon img").src = event.image;

    document.getElementById("bottom-events").appendChild(root);
  }

  document.querySelector("#top-events #root-event").remove();
  document.querySelector("#bottom-events #root-event").remove();
});
