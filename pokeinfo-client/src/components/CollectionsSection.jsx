import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCollections, createCollection, deleteCollection } from "../services/collectionService";
import "../styles/colorPalette.css";
import "../styles/collections.css";

export default function CollectionsSection() {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState("");
    const [newCollectionDescription, setNewCollectionDescription] = useState("");
    const [creatingCollection, setCreatingCollection] = useState(false);

    useEffect(() => {
        fetchCollections();
    }, []);

    async function fetchCollections() {
        try {
            setLoading(true);
            const data = await getCollections();
            setCollections(data);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateCollection(e) {
        e.preventDefault();

        if (!newCollectionName.trim()) {
            setError("Collection name is required");
            return;
        }

        try {
            setCreatingCollection(true);
            await createCollection(newCollectionName, newCollectionDescription);
            setNewCollectionName("");
            setNewCollectionDescription("");
            setShowCreateForm(false);
            await fetchCollections();
        } catch (err) {
            setError(err.message);
        } finally {
            setCreatingCollection(false);
        }
    }

    async function handleDeleteCollection(collectionId) {
        if (!window.confirm("Are you sure you want to delete this collection?")) {
            return;
        }

        try {
            await deleteCollection(collectionId);
            await fetchCollections();
        } catch (err) {
            setError(err.message);
        }
    }

    if (loading) {
        return <div className="collections-loading">Loading collections...</div>;
    }

    return (
        <section className="collections-section">
            <div className="collections-header">
                <h2>My Collections</h2>
                <button
                    className="create-collection-button"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? "Cancel" : "+ Create Collection"}
                </button>
            </div>

            {error && <div className="collections-error">{error}</div>}

            {showCreateForm && (
                <form className="create-collection-form" onSubmit={handleCreateCollection}>
                    <div className="form-group">
                        <label htmlFor="name">Collection Name *</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="e.g., My Favorite Pokémon"
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            disabled={creatingCollection}
                            maxLength="100"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            placeholder="e.g., A collection of my favorite water-type Pokémon"
                            value={newCollectionDescription}
                            onChange={(e) => setNewCollectionDescription(e.target.value)}
                            disabled={creatingCollection}
                            maxLength="500"
                            rows="3"
                        />
                    </div>
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={creatingCollection}
                    >
                        {creatingCollection ? "Creating..." : "Create Collection"}
                    </button>
                </form>
            )}

            {collections.length === 0 ? (
                <div className="no-collections">
                    <p>You don't have any collections yet. Create your first one!</p>
                </div>
            ) : (
                <div className="collections-list">
                    {collections.map((collection) => (
                        <div key={collection.id} className="collection-card">
                            <div className="collection-card-header">
                                <div className="collection-info-section">
                                    <h3>{collection.name}</h3>
                                    <p className="collection-count">
                                        {collection.pokemons.length} Pokémon
                                    </p>
                                    {collection.description && (
                                        <p className="collection-preview">{collection.description}</p>
                                    )}
                                </div>
                                <div className="collection-card-actions">
                                    <Link
                                        to={`/collections/${collection.id}`}
                                        className="view-button"
                                    >
                                        View Details
                                    </Link>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteCollection(collection.id)}
                                        title="Delete collection"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="collection-meta">
                                <span className="meta-text">
                                    Created: {new Date(collection.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
