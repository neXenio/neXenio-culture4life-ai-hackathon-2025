# Clean Code Principles

Using **well-named functions** instead of comments is preferred because **good code should explain itself**. Here's why this approach is better:

### 1. Self-Descriptive Code is Easier to Understand

A well-named function like `calculateInvoiceTotal()` tells you exactly what it does — just like a comment would — but it's **active**, not passive.  
Instead of writing:

```java
// This function calculates the total of the invoice
public double foo(List<Item> items) { ... }
```

You write:

```java
public double calculateInvoiceTotal(List<Item> items) { ... }
```

No need for a comment — the function name already **communicates intent**.

---

### 2. Comments Can Lie — Code Can't

Comments can become outdated or incorrect when the code changes, but the comment doesn't.  
For example:

```python
# This adds tax
total = subtotal * 1.15  # (actually adds discount now)
```

This can confuse other developers. A function like `applyDiscount()` is much **less likely to mislead**.

---

### 3. Functions Encourage Modularity

By creating small, clearly named functions, your code becomes more **modular**, **testable**, and **reusable**.  
This aligns with the **Single Responsibility Principle** — each function does *one thing well*, and its name says what that thing is.

---

### 4. Improves Readability at a Higher Level

Good names let you read code like a **story**.  
Instead of:

```java
// Load user
// Check permissions
// Display dashboard
```

You can write:

```java
loadUser();
checkPermissions();
displayDashboard();
```

This tells the story clearly — without any comments — just by using **descriptive function names**.

---

### 🧠 TL;DR

> “Don’t comment bad code — rewrite it.” — Robert C. Martin (Uncle Bob)

Good function names make your code **clearer, safer, and easier to maintain** than comments ever could.

---

## ✨ Clean Code – Summary

**Clean Code** by Robert C. Martin outlines timeless principles and practical techniques for writing clean, maintainable, and professional code. Here's a quick summary:

- **Meaningful Names**: Use descriptive names that reveal intent.
- **Small Functions**: Functions should do one thing and be small.
- **Single Responsibility Principle**: Every class/function should have one reason to change.
- **Code Formatting**: Consistent layout improves readability.
- **Avoid Comments (when possible)**: Instead, write expressive code.
- **Error Handling**: Handle errors clearly and don't obscure logic.
- **Tests Matter**: Write clean test code with the same care as production code.
- **Refactor Relentlessly**: Always strive to improve clarity and structure.

> Writing clean code is not just about making it work — it’s about making it understandable, changeable, and maintainable.