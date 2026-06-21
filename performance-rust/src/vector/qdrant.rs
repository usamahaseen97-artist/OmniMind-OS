use anyhow::Result;

pub async fn upsert_embedding(_collection: &str, _id: u64, _vector: Vec<f32>) -> Result<()> {
    // TODO: wire to Qdrant service over gRPC/HTTP.
    Ok(())
}

pub async fn nearest_neighbors(_collection: &str, _query: Vec<f32>, _k: u64) -> Result<Vec<u64>> {
    // TODO: return nearest vector ids for OmniMind tools.
    Ok(vec![])
}
