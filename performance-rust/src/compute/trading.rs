pub fn rsi(prices: &[f64], period: usize) -> Option<f64> {
    if prices.len() <= period || period == 0 {
        return None;
    }
    let mut gains = 0.0;
    let mut losses = 0.0;
    for i in 1..=period {
        let delta = prices[i] - prices[i - 1];
        if delta >= 0.0 {
            gains += delta;
        } else {
            losses += -delta;
        }
    }
    if losses == 0.0 {
        return Some(100.0);
    }
    let rs = gains / losses;
    Some(100.0 - (100.0 / (1.0 + rs)))
}
