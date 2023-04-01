use std::io;

fn main() {
    let mut op = String::new();
    let mut num1 = String::new();
    let mut num2 = String::new();

    println!("Enter operator either + or - or * or /: ");
    io::stdin().read_line(&mut op).expect("Failed to read line");

    println!("Enter two operands: ");
    io::stdin()
        .read_line(&mut num1)
        .expect("Failed to read line");
    io::stdin()
        .read_line(&mut num2)
        .expect("Failed to read line");

    let num1: f32 = num1.trim().parse().expect("Invalid input");
    let num2: f32 = num2.trim().parse().expect("Invalid input");

    match op.trim() {
        "+" => println!("{}", num1 + num2),
        "-" => println!("{}", num1 - num2),
        "*" => println!("{}", num1 * num2),
        "/" => println!("{}", num1 / num2),
        _ => println!("Invalid operator"),
    }
}
