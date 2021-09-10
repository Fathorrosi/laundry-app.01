import React from 'react'
import DataTable from '../../components/data-table/DataTable'
import './dashboard.css'

export default function Dashboard() {
    return (
        <div className="dashboard">
            <DataTable isDashboard="true" />
        </div>
    )
}
