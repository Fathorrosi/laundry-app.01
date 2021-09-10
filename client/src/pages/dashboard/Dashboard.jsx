import React from 'react'
import DataCard from '../../components/data-card/DataCard'
import DataTable from '../../components/data-table/DataTable'
import './dashboard.css'

export default function Dashboard() {
    return (
        <div className="dashboard">
            <DataCard />
            <DataTable isDashboard="true"/>
        </div>
    )
}
