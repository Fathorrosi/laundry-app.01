import './dataCard.css'
import { FaCalendarAlt, FaCalendarDay, FaCheckCircle, FaRunning } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function DataCard(props) {
    const [monthly, setMonthly] = useState(0);
    const [today, setToday] = useState(0);
    const [finish, setFinish] = useState(0);
    const [proses, setProses] = useState(0);
    const [monthsName, setMonthsName] = useState('');

    const date = new Date();
    const m = date.getMonth() + 1;

    useEffect(() => {
        initiateData(props.data);
        setMonthsName(date.toLocaleString('default', { month: 'long' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.data])

    const initiateData = (data) => {
        let tempProses = 0;
        let tempFinish = 0;
        let tempMonthly = 0;
        let tempToday = 0;

        for (let x of data) {
            if (x['status'].toLowerCase() === 'selesai') {
                tempFinish = tempFinish + 1;
            } if (x['status'].toLowerCase() === 'proses') {
                tempProses = tempProses + 1;
            } if (getMonthDate(x['tgl_masuk']).toString() === m.toString()) {
                tempMonthly = tempMonthly + 1;
            } if (getDate(date) === getDate(x['tgl_masuk'])) {
                tempToday = tempToday + 1;
            }
        }
        setFinish(tempFinish);
        setProses(tempProses);
        setMonthly(tempMonthly);
        setToday(tempToday);
    }

    const getMonthDate = (date) => {
        let tempDate = new Date(date)
        return (tempDate.getMonth() + 1);
    }

    const getDate = (date) => {
        let d = new Date(date);
        let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
        let mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
        let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
        return ye + '-' + mo + '-' + da;
    }

    return (
        <ul>
            <li className="card">
                <div className="data-icon"
                    style={{ background: '#7aebf1' }}>
                    <FaCalendarAlt />
                </div>
                <div className="data-desc">
                    <div className="month">{monthsName}</div>
                    <span className="value">{monthly}</span>
                    <span style={{ fontSize: 'small', color: 'grey' }}> Customers</span>
                </div>
            </li>

            <li className="card">
                <div className="data-icon"
                    style={{ background: '#987af1' }}>
                    <FaCalendarDay />
                </div>
                <div className="data-desc">
                    <div className="month">Hari ini</div>
                    <span className="value">{today}</span>
                    <span style={{ fontSize: 'small', color: 'grey' }}> Customers</span>
                </div>
            </li>
            <li className="card">
                <div className="data-icon" style={{ background: '#f1807a' }}>
                    <FaCheckCircle />
                </div>
                <div className="data-desc">
                    <div className="month">Selesai</div>
                    <span className="value">{finish}</span>
                    <span style={{ fontSize: 'small', color: 'grey' }}> Customers</span>
                </div>
            </li>
            <li className="card">
                <div className="data-icon"
                    style={{ background: '#f1c77a' }}>
                    <FaRunning />
                </div>
                <div className="data-desc">
                    <div className="month">Proses</div>
                    <span className="value">{proses}</span>
                    <span style={{ fontSize: 'small', color: 'grey' }}> Customers</span>
                </div>
            </li>
        </ul>
    )
}
