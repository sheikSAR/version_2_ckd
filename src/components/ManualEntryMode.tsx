import React, { useState, useEffect } from 'react'
import { ConfigurationData } from '../types'
import '../styles/ManualEntryMode.css'

interface PropertyField {
  id: string
  name: string
  value: string
}

interface EntryItem {
  id: string
  itemId: string
  properties: PropertyField[]
}

interface ManualEntryModeProps {
  onDataChange: (data: ConfigurationData) => void
}

const ManualEntryMode: React.FC<ManualEntryModeProps> = ({ onDataChange }) => {
  const [entries, setEntries] = useState<EntryItem[]>([
    { id: '1', itemId: '', properties: [{ id: '1-1', name: '', value: '' }] },
  ])

  useEffect(() => {
    const data: ConfigurationData = entries.reduce((acc, entry) => {
      if (entry.itemId.trim()) {
        const nestedObj = entry.properties.reduce((propAcc, prop) => {
          if (prop.name.trim()) {
            propAcc[prop.name] = prop.value
          }
          return propAcc
        }, {} as Record<string, string>)

        if (Object.keys(nestedObj).length > 0) {
          acc[entry.itemId] = nestedObj
        }
      }
      return acc
    }, {} as ConfigurationData)

    onDataChange(data)
  }, [entries, onDataChange])

  const handleItemIdChange = (entryId: string, newItemId: string) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, itemId: newItemId } : entry))
    )
  }

  const handlePropertyNameChange = (entryId: string, propId: string, newName: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              properties: entry.properties.map((prop) =>
                prop.id === propId ? { ...prop, name: newName } : prop
              ),
            }
          : entry
      )
    )
  }

  const handlePropertyValueChange = (entryId: string, propId: string, newValue: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              properties: entry.properties.map((prop) =>
                prop.id === propId ? { ...prop, value: newValue } : prop
              ),
            }
          : entry
      )
    )
  }

  const handleAddProperty = (entryId: string) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === entryId) {
          const newPropId = `${entryId}-${Math.max(...entry.properties.map((p) => parseInt(p.id.split('-')[1], 10)), 0) + 1}`
          return {
            ...entry,
            properties: [...entry.properties, { id: newPropId, name: '', value: '' }],
          }
        }
        return entry
      })
    )
  }

  const handleRemoveProperty = (entryId: string, propId: string) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === entryId && entry.properties.length > 1) {
          return {
            ...entry,
            properties: entry.properties.filter((prop) => prop.id !== propId),
          }
        }
        return entry
      })
    )
  }

  const handleAddEntry = () => {
    const newId = String(Math.max(...entries.map((e) => parseInt(e.id, 10)), 0) + 1)
    setEntries((prev) => [...prev, { id: newId, itemId: '', properties: [{ id: `${newId}-1`, name: '', value: '' }] }])
  }

  const handleRemoveEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries((prev) => prev.filter((entry) => entry.id !== id))
    }
  }

  return (
    <div className="manual-entry-section">
      <h3>Enter Configuration Manually</h3>
      <div className="entry-builder">
        {entries.map((entry) => (
          <div key={entry.id} className="entry-item">
            <div className="entry-row">
              <input
                type="text"
                placeholder="ID"
                value={entry.itemId}
                onChange={(e) => handleItemIdChange(entry.id, e.target.value)}
                className="entry-field field-id"
              />
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveEntry(entry.id)}
                  className="remove-button"
                >
                  Remove Entry
                </button>
              )}
            </div>

            <div className="properties-section">
              {entry.properties.map((prop) => (
                <div key={prop.id} className="property-row">
                  <input
                    type="text"
                    placeholder="Column name"
                    value={prop.name}
                    onChange={(e) => handlePropertyNameChange(entry.id, prop.id, e.target.value)}
                    className="entry-field field-name"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={prop.value}
                    onChange={(e) => handlePropertyValueChange(entry.id, prop.id, e.target.value)}
                    className="entry-field field-value"
                  />
                  {entry.properties.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProperty(entry.id, prop.id)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleAddProperty(entry.id)}
              className="add-property-button"
            >
              + Add Property
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={handleAddEntry} className="add-button">
        + Add ID Entry
      </button>
    </div>
  )
}

export default ManualEntryMode
