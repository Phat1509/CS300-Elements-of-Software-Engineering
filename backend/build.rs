fn main() {
    utoipa_config::Config::new()
        .alias_for(
            "DateTimeWithTimeZone",
            "chrono::DateTime<chrono::FixedOffset>",
        )
        .write_to_file();
}
