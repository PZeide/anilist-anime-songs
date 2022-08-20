import style from "../style.module.css";
import { rawRequest } from "../network";
import { populateSentece } from "../utils";

const REPORT_STAFF_URL =
  "https://maker.ifttt.com/trigger/staff_mappings_report/with/key/ouuC58ABvq49sXEngMUaNqg0FZn7oFM8pnY4cPUqRKz";

type Properties = {
  staffs: AnimeSongStaff[];
  showGroupMembers: boolean;
};

function reportStaff(staff: AnimeSongStaff) {
  const data = {
    value1: staff.id.toString(),
    value2: staff.anilistId?.toString() || "null",
    value3: populateSentece(staff.names).join(""),
  };

  rawRequest(REPORT_STAFF_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    data: JSON.stringify(data),
  });
}

function GroupIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={style.groupIcon}
    >
      <path d="M16 11C18.2091 11 20 9.20914 20 7C20 4.79086 18.2091 3 16 3C13.7909 3 12 4.79086 12 7C12 9.20914 13.7909 11 16 11ZM10 7.5C10 9.433 8.433 11 6.5 11C4.567 11 3 9.433 3 7.5C3 5.567 4.567 4 6.5 4C8.433 4 10 5.567 10 7.5ZM29 7.5C29 9.433 27.433 11 25.5 11C23.567 11 22 9.433 22 7.5C22 5.567 23.567 4 25.5 4C27.433 4 29 5.567 29 7.5ZM9.37731 13C8.82836 13.6848 8.5 14.5541 8.5 15.5V23C8.5 24.2346 8.79833 25.3996 9.32683 26.4267C8.63182 26.7928 7.84011 27 7 27C4.23858 27 2 24.7614 2 22V15.5C2 14.1193 3.11929 13 4.5 13H9.37731ZM22.6732 26.4267C23.2017 25.3996 23.5 24.2346 23.5 23V15.5C23.5 14.5541 23.1716 13.6848 22.6227 13H27.5C28.8807 13 30 14.1193 30 15.5V22C30 24.7614 27.7614 27 25 27C24.1599 27 23.3682 26.7928 22.6732 26.4267ZM12.5 13C11.1193 13 10 14.1193 10 15.5V23C10 26.3137 12.6863 29 16 29C19.3137 29 22 26.3137 22 23V15.5C22 14.1193 20.8807 13 19.5 13H12.5Z" />
    </svg>
  );
}

function GroupPopup(props: { group: AnimeSongStaff }) {
  return (
    <div className={style.membersPopup}>
      <div>Group members: </div>
      <SongStaffs staffs={props.group.members} showGroupMembers={false} />
    </div>
  );
}

export function SongStaffs(props: Properties) {
  function onClick(event: MouseEvent, staff: AnimeSongStaff) {
    if (event.altKey && event.button === 0 && !staff.rateLimited) {
      console.log(`Reporting staff ${staff.id}`);
      reportStaff(staff);
      const element = event.target as HTMLElement;
      element.style.cssText = "color: #bc4349 !important;";
      event.preventDefault();
    }
  }

  const popups: Record<number, HTMLElement> = {};
  const popupTimeouts: Record<number, NodeJS.Timeout> = {};

  function onMouseOver(event: MouseEvent, staff: AnimeSongStaff) {
    if (!props.showGroupMembers) return;
    if (staff.id == null || staff.members.length === 0) return;
    if (!(event.target instanceof Element)) return;
    const targetElement = event.target as Element;

    if (popups[staff.id] === undefined) {
      const virtualElement = <GroupPopup group={staff} />;
      const popupElement = document.body.appendChild(
        VM.m(virtualElement)
      ) as HTMLElement & HTMLElement[];
      popups[staff.id] = popupElement;

      popupElement.onmouseover = (e) => onMouseOver(e, staff);
      popupElement.onmouseout = (e) => onMouseOut(e, staff);

      // Show the popup just below the targetElement
      const targetRect = targetElement.getBoundingClientRect();
      const popupRect = popupElement.getBoundingClientRect();
      popupElement.style.top = `${
        targetRect.top + window.scrollY - popupRect.height - 6
      }px`;
      popupElement.style.left = `${targetRect.left + window.scrollX - 20}px`;
      popupElement.style.opacity = "1";
    } else {
      if (popupTimeouts[staff.id] !== undefined) {
        clearTimeout(popupTimeouts[staff.id]);
        popupTimeouts[staff.id] = undefined;
      }
    }
  }

  function onMouseOut(_: MouseEvent, staff: AnimeSongStaff) {
    if (!props.showGroupMembers) return;
    if (staff.id == null || staff.members.length === 0) return;

    if (
      popups[staff.id] !== undefined &&
      popupTimeouts[staff.id] === undefined
    ) {
      popupTimeouts[staff.id] = setTimeout(() => {
        const popupElement = popups[staff.id];
        popupElement.style.opacity = "0";

        setTimeout(() => {
          popupElement.remove();
        }, 200);

        delete popups[staff.id];
        delete popupTimeouts[staff.id];
      }, 300);
    }
  }

  return (
    <>
      {populateSentece(props.staffs).map((data) => {
        if (typeof data === "string") return <span>{data}</span>;

        if (data.anilistId !== null) {
          return (
            <a
              href={`https://anilist.co/staff/${data.anilistId}`}
              data-id={data.id}
              onclick={(e: MouseEvent) => onClick(e, data)}
              onmouseover={(e: MouseEvent) => onMouseOver(e, data)}
              onmouseout={(e: MouseEvent) => onMouseOut(e, data)}
            >
              {data.members.length > 0 && props.showGroupMembers && (
                <GroupIcon />
              )}
              {data.names[0]}
            </a>
          );
        } else {
          return (
            <span
              data-id={data.id}
              onclick={(e: MouseEvent) => onClick(e, data)}
              onmouseover={(e: MouseEvent) => onMouseOver(e, data)}
              onmouseout={(e: MouseEvent) => onMouseOut(e, data)}
              {...(data.rateLimited && { style: "color: #bc4349 !important;" })}
            >
              {data.members.length > 0 && props.showGroupMembers && (
                <GroupIcon />
              )}
              {data.names[0]}
            </span>
          );
        }
      })}
    </>
  );
}
