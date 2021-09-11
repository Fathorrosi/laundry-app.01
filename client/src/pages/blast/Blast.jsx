import React from 'react'
import "./blast.css";
import { DataGrid } from "@material-ui/data-grid";
import { useState, useEffect } from "react";
import Axios from "axios";
import Swal from 'sweetalert2'
import QRCode from "react-qr-code";
import {
    AiFillCheckCircle,
    AiFillMinusCircle
} from 'react-icons/ai';
import { BsFillCircleFill } from "react-icons/bs";
import { isProgress, setIsProgress } from '../../global-variable';

export default function Blast() {
    const [message, setMessage] = useState([]);
    const [dataReport, setDataReport] = useState([]);
    const [dataBroadcast, setDataBroadcast] = useState([]);
    const [reportSend, setReportSend] = useState(0);
    const [reportNotSend, setReportNotSend] = useState(0);
    const [broadcastSend, setBroadcastSend] = useState(0);
    const [broadcastNotSend, setBroadcastNotSend] = useState(0);
    const [log, setLog] = useState('');
    const [qrcode, setQrcode] = useState('');
    const [onProgress, setOnProgress] = useState(false);

    useEffect(() => {
        Axios.get("http://localhost:3001/getMessage").then((response) => {
            setMessage(response.data);
        });
        let tempDate;
        const interval = setInterval(() => {
            Axios.get("http://localhost:3001/dataReport").then((response) => {
                setDataReport(response.data);
                let tempRs = 0;
                let tempRns = 0;
                for (let x of response.data) {
                    if (x['report'] === 1) {
                        tempRs = tempRs + 1
                    } else {
                        tempRns = tempRns + 1
                    }
                }
                setReportSend(tempRs);
                setReportNotSend(tempRns);
            });
            Axios.get("http://localhost:3001/dataBroadcast").then((response) => {
                setDataBroadcast(response.data);
                let tempBs = 0;
                let tempBns = 0;
                for (let x of response.data) {
                    if (x['isBroadcast'] === 1) {
                        tempBs = tempBs + 1
                    } else {
                        tempBns = tempBns + 1
                    }
                }
                setBroadcastSend(tempBs);
                setBroadcastNotSend(tempBns);
            });
            Axios.get("http://localhost:3001/readLogFile").then(async (response) => {
                let tempQr = localStorage.getItem('qrcode')
                let tempLog = response.data.log;
                let textarea = document.getElementById('log');

                setLog(response.data.log);
                setQrcode(response.data.qrcode);
                if (isProgress === true) {
                    document.getElementById("report-btn").disabled = true;
                    document.getElementById("broadcast-btn").disabled = true;
                    setOnProgress(true)
                }

                if (tempDate !== getTime()) {
                    if (tempLog.includes(getTime() + ' Finished')) {
                        tempDate = getTime()
                        console.log('Done')
                        document.getElementById("report-btn").disabled = false;
                        document.getElementById("broadcast-btn").disabled = false;
                        setOnProgress(false)
                        setIsProgress(false)
                    }
                }
                if (response.data.qrcode !== tempQr) {
                    alert('Scan barcode disamping untuk validasi whatsapp.')
                }
                localStorage.setItem('qrcode', response.data.qrcode)
                textarea.scrollTop = textarea.scrollHeight;
            });
        }, 2000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleView = (pesan) => {
        Swal.fire({
            title: "Pesan",
            html: pesan,
            confirmButtonText: "Ok",
        });
    }

    const handleEdit = (id) => {
        Swal.fire({
            input: 'textarea',
            inputLabel: 'Message',
            inputPlaceholder: 'Type your message here...',
            inputAttributes: {
                'aria-label': 'Type your message here'
            },
            showCancelButton: true
        }).then(value => {
            if (value.value !== undefined) {
                Axios.put("http://localhost:3001/updateMessage", { message: value.value, id: id }).then(
                    async (result) => {
                        if (result) {
                            let tempData = message.slice()
                            for (let x of tempData) {
                                if (x["id"] === id) {
                                    x["konten"] = value.value;
                                    setMessage(tempData);
                                    break;
                                }
                            }
                        }
                    }
                );
                Swal.fire({
                    icon: 'success',
                    title: 'Pesan berhasil diupdate!!',
                    showConfirmButton: false,
                    timer: 1000
                })
            }
        })
    }

    const broadcastMessage = async () => {
        Swal.fire({
            title: 'Apakah kamu yakin?',
            text: "Pesan akan dikirimkan pada semua customer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Broadcast!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                document.getElementById("report-btn").disabled = true;
                document.getElementById("broadcast-btn").disabled = true;
                setOnProgress(true);
                setIsProgress(true);
                var TemplistPhone = [];
                var listPhone = [];
                for (let index = 0; index < dataBroadcast.length; index++) {
                    TemplistPhone.push(dataBroadcast[index].handphone)
                }
                listPhone = [...new Set(TemplistPhone)];
                await Axios.put("http://localhost:3001/sendBroadcast", { handphone: listPhone })
            }
        })
    }

    const reportMessage = async () => {
        Swal.fire({
            title: 'Apakah kamu yakin?',
            text: "Report akan dikirimkan pada semua customer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Send report!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                sendMessage();
            }
        })
    }

    const sendMessage = async () => {
        var TemplistPhone = [];
        var listPhone = [];
        var TemplistName = [];
        var listName = [];

        for (let index = 0; index < dataReport.length; index++) {
            if (dataReport[index].report === 0) {
                TemplistPhone.push(dataReport[index].handphone)
                TemplistName.push(dataReport[index].nama)
            }
        }
        listPhone = [...new Set(TemplistPhone)];
        listName = [...new Set(TemplistName)];
        if (listName.length !== 0) {
            Axios.put("http://localhost:3001/sendReport",
                { handphone: listPhone, nama: listName });
            document.getElementById("report-btn").disabled = true;
            document.getElementById("broadcast-btn").disabled = true;
            setOnProgress(true);
            setIsProgress(true);
        } else {
            alert('Semua report hari ini sudah terkirim.')
        }
    }

    const getTime = () => {
        let d = new Date();
        let hh = new Intl.DateTimeFormat('en', { hour: '2-digit' }).format(d);
        let mm = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(d);
        return hh + ':' + mm;
    }

    const columnsMsg = [
        { field: "id", headerName: "ID", width: 100 },
        { field: "tipe", headerName: "Tipe", width: 150 },
        { field: "konten", headerName: "Konten", width: 350 },
        {
            field: "action",
            headerName: "Action",
            width: 200,
            renderCell: (params) => {
                return (
                    <>
                        <button onClick={() => handleEdit(params.row.id)} className="edit-message">Edit</button>
                        <button onClick={() => handleView(params.row.konten)} className="edit-message">View</button>
                    </>
                );
            },
        }
    ];

    const columnsReport = [
        { field: "id", headerName: "ID", width: 100 },
        { field: "handphone", headerName: "Hp", width: 120 },
        {
            field: "report", headerName: "Status", width: 120,
            renderCell: (params) => {
                return (
                    <>
                        {params.row.report === 0
                            ? <><AiFillMinusCircle className="not-send" /> &nbsp; Belum terkirim </>
                            : <><AiFillCheckCircle className="send" /> &nbsp; Terkirim </>
                        }
                    </>
                );
            },
        },
    ];

    const columnsBroadcast = [
        { field: "id", headerName: "ID", width: 100 },
        { field: "handphone", headerName: "Hp", width: 120 },
        {
            field: "isBroadcast", headerName: "Status", width: 120,
            renderCell: (params) => {
                return (
                    <>
                        {params.row.isBroadcast === 0
                            ? <><AiFillMinusCircle className="not-send" /> &nbsp; Belum terkirim </>
                            : <><AiFillCheckCircle className="send" /> &nbsp; Terkirim </>
                        }
                    </>
                );
            },
        },
    ];

    return (
        <div className="blast">
            <div className="blast-card">
                <div className="message-table" style={{ height: 250, width: '100%' }}>
                    <DataGrid
                        style={{ fontSize: 12, borderWidth: "2px", borderColor: "#b6b6b6", borderStyle: 'solid' }}
                        rows={message}
                        disableSelectionOnClick
                        columns={columnsMsg}
                        pageSize={5}
                    />
                </div>
                <div className="barcode">
                    <QRCode size="110" value={qrcode} />
                    <br />
                    <h5>Scan this barcode to </h5>
                    <h5>validate your Whatsapp</h5>
                </div>
                <div className="report-table" style={{ height: 400, width: '100%' }}>
                    <div>List Report per hari ini </div>
                    <DataGrid
                        style={{ fontSize: 12, borderWidth: "2px", borderColor: "#b6b6b6", borderStyle: 'solid' }}
                        rows={dataReport}
                        disableSelectionOnClick
                        columns={columnsReport}
                        pageSize={5}
                    />
                    <div style={{ fontSize: 12, textAlign: 'right' }}>terkirim : {reportSend} , Belum terkirim : {reportNotSend}</div>
                </div>
                <div className="broadcast-table" style={{ height: 400, width: '100%' }}>
                    <div>List Broadcast</div>
                    <DataGrid
                        style={{ fontSize: 12, borderWidth: "2px", borderColor: "#b6b6b6", borderStyle: 'solid' }}
                        rows={dataBroadcast}
                        disableSelectionOnClick
                        columns={columnsBroadcast}
                        pageSize={5}
                    />
                    <div style={{ fontSize: 12, textAlign: 'right' }}>terkirim : {broadcastSend} , Belum terkirim : {broadcastNotSend}</div>
                </div>

                <div className="log">
                    <div style={{ fontSize: 14 }}>Log proses pengiriman pesan
                        <BsFillCircleFill style={{ color: onProgress === true ? 'red' : 'green', float: 'right' }} /></div>
                    <textarea id="log" value={log}></textarea>
                </div>

                <button onClick={() => reportMessage()} id="report-btn" className="report-btn"> Report </button>
                <button onClick={() => broadcastMessage()} id="broadcast-btn" className="broadcast-btn"> Broadcast </button>
            </div>
        </div>
    )
}
