import styles from "./styles.module.scss"

export function Circles() {
    return (
        <svg className={styles.circles} viewBox="-0.5 -0.5 1140 700">
            <circle
                className={styles.circle}
                cx="570"
                cy="570"
                r="30"
                stroke="rgba(160,160,160, 1)"
            />

            <circle
                className={styles.circle}
                cx="570"
                cy="570"
                r="100"
                stroke="rgba(160,160,160, 1)"
            />

            <circle
                className={styles.circle}
                cx="570"
                cy="570"
                r="200"
                stroke="rgba(160,160,160, 1)"
            />

            <circle
                className={styles.circle}
                cx="570"
                cy="570"
                r="300"
                stroke="rgba(160,160,160, 1)"
            />

            <circle
                className={styles.circle}
                cx="570"
                cy="570"
                r="400"
                stroke="rgba(160,160,160, 1)"
            />

            <circle
                className={styles.circle}
                cx="570"
                cy="570"
                r="500"
                stroke="rgba(160,160,160, 1)"
            />
        </svg>
    )
}
